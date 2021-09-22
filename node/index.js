const Cache = require("node-redis").Cache,
    ClientCredentialsAuthProvider = require("@twurple/auth").ClientCredentialsAuthProvider,
    compression = require("compression"),
    cookieParser = require("cookie-parser"),
    EventSubMiddleware = require("@twurple/eventsub").EventSubMiddleware,
    express = require("express"),
    HotRouter = require("hot-router"),
    Log = require("node-application-insights-logger"),
    Minify = require("node-minify"),
    path = require("path"),
    Redis = require("node-redis"),
    TwitchClient = require("@twurple/api").ApiClient,
    util = require("util"),

    Discord = require("./src/discord"),
    EventSub = require("./src/twitch/eventsub"),
    Exception = require("./src/errors/exception"),
    Listeners = require("./src/listeners"),
    Redirects = require("./src/redirects"),
    Twitch = require("./src/twitch");

process.on("unhandledRejection", (reason) => {
    Log.error("Unhandled promise rejection caught.", {err: reason instanceof Error ? reason : new Error(util.inspect(reason))});
});

//         #                 #
//         #                 #
//  ###   ###    ###  ###   ###   #  #  ###
// ##      #    #  #  #  #   #    #  #  #  #
//   ##    #    # ##  #      #    #  #  #  #
// ###      ##   # #  #       ##   ###  ###
//                                      #
/**
 * Starts up the application.
 */
(async function startup() {
    // Setup application insights.
    if (process.env.APPINSIGHTS_INSTRUMENTATIONKEY !== "") {
        Log.setupApplicationInsights(process.env.APPINSIGHTS_INSTRUMENTATIONKEY, {application: "sixgg", container: "sixgg-node"});
    }

    Log.info("Starting up...");

    // Set title.
    if (process.platform === "win32") {
        process.title = "Six Gaming";
    } else {
        process.stdout.write("\x1b]2;Six Gaming\x1b\x5c");
    }

    // Setup various listeners.
    Listeners.setup();

    try {
        // Startup Twitch.
        await Twitch.connect();
    } catch (err) {
        // Exit the app, there was likely a problem connecting to the database.
        Log.error("Could not connect to Twitch.", {err});
        process.exit(1);
    }

    // Startup Discord.
    Discord.startup();
    await Discord.connect();

    // Setup Redis.
    Redis.setup({
        host: "redis",
        port: +process.env.REDIS_PORT,
        password: process.env.REDIS_PASSWORD
    });
    Redis.eventEmitter.on("error", (err) => {
        Log.error(`Redis error: ${err.message}`, {err: err.err});
    });
    await Cache.flush();

    // Setup express app.
    const app = express();

    // Remove powered by.
    app.disable("x-powered-by");

    // Initialize middleware stack.
    app.use(express.json());
    app.use(compression());
    app.use(cookieParser());

    // Trust proxy to get correct IP from web server.
    app.enable("trust proxy");

    // Setup Twurple EventSub.
    const eventSub = new EventSubMiddleware({
        apiClient: new TwitchClient({
            authProvider: new ClientCredentialsAuthProvider(process.env.TWITCH_CLIENTID, process.env.TWITCH_CLIENTSECRET),
            logger: {
                colors: false
            }
        }),
        hostName: "six.gg",
        pathPrefix: "/twitch/eventsub",
        secret: process.env.TWITCH_CHANNEL_EVENTSUB_SECRET
    });
    await eventSub.apply(app);

    // Setup public redirects.
    app.use(/^(?!\/tsconfig\.json)/, express.static("public"));

    // Setup Discord redirect.
    app.get("/discord", (req, res) => {
        res.redirect(process.env.SIXGG_DISCORD_URL);
    });

    // Setup minification.
    Minify.setup({
        cssRoot: "/css/",
        jsRoot: "/js/",
        wwwRoot: path.join(__dirname, "public"),
        caching: process.env.MINIFY_CACHE ? {
            get: async (key) => {
                try {
                    return await Cache.get(key);
                } catch (err) {
                    Log.error("An error occurred while attempting to get a Minify cache.", {err, properties: {key}});
                    return void 0;
                }
            },
            set: (key, value) => {
                Cache.add(key, value, new Date(new Date().getTime() + 86400000)).catch((err) => {
                    Log.error("An error occurred while attempting to set a Minify cache.", {err, properties: {key}});
                });
            },
            prefix: process.env.REDIS_PREFIX
        } : void 0,
        redirects: Redirects,
        disableTagCombining: !process.env.MINIFY_ENABLED
    });
    app.get("/css", Minify.cssHandler);
    app.get("/js", Minify.jsHandler);

    // Setup redirect routes.
    app.get("*", (req, res, next) => {
        const redirect = Redirects[req.path];
        if (!redirect) {
            next();
            return;
        }

        res.status(200).contentType(redirect.contentType).sendFile(`${redirect.path}`);
    });

    // Setup hot-router.
    const router = new HotRouter.Router();
    router.on("error", (data) => {
        if (data.err && data.err instanceof Exception) {
            Log.error(data.message, {err: data.err.innerError, req: data.req});
        } else {
            Log.error(data.message, {err: data.err, req: data.req});
        }
    });
    try {
        app.use("/", await router.getRouter(path.join(__dirname, "web"), {hot: false}));
    } catch (err) {
        Log.critical("Could not set up routes.", {err});
    }

    app.use((err, req, res, next) => {
        router.error(err, req, res, next);
    });

    // Startup web server.
    const port = process.env.PORT || 3030;

    app.listen(port, async () => {
        await EventSub.setup(eventSub);
        await Twitch.setupEventSub();
    });
    Log.info(`Server PID ${process.pid} listening on port ${port}.`);
}());
