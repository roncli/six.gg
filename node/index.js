const AppTokenAuthProvider = require("@twurple/auth").AppTokenAuthProvider,
    compression = require("compression"),
    cookieParser = require("cookie-parser"),
    EventSub = require("./src/twitch/eventsub"),
    EventSubMiddleware = require("@twurple/eventsub-http").EventSubMiddleware,
    Exception = require("./src/errors/exception"),
    express = require("express"),
    HotRouter = require("hot-router"),
    Log = require("@roncli/node-application-insights-logger"),
    Minify = require("@roncli/node-minify"),
    path = require("path"),
    Redirects = require("./src/redirects"),
    Redis = require("@roncli/node-redis"),
    TwitchClient = require("@twurple/api").ApiClient,
    util = require("util");

const Cache = Redis.Cache;

process.on("unhandledRejection", (reason) => {
    Log.error("Unhandled promise rejection caught.", {err: reason instanceof Error ? reason : new Error(util.inspect(reason))});
});

// MARK: class Index
/**
 * The primary class for the application.
 */
class Index {
    // MARK: static async #getMinifyCache
    /**
     * Gets a minified cache item.
     * @param {string} key The key to get the cache item for.
     * @returns {Promise<string>} The cache item.
     */
    static async #getMinifyCache(key) {
        try {
            return await Cache.get(key);
        } catch (err) {
            Log.error("An error occurred while attempting to get a Minify cache.", {err, properties: {key}});
            return void 0;
        }
    }

    // MARK: static async #setMinifyCache
    /**
     * Sets a minified cache item.
     * @param {string} key The key to set the cache item for.
     * @param {object} value The cache item.
     * @returns {Promise<void>}
     */
    static async #setMinifyCache(key, value) {
        try {
            await Cache.add(key, value, new Date(new Date().getTime() + 86400000));
        } catch (err) {
            Log.error("An error occurred while attempting to set a Minify cache.", {err, properties: {key}});
        }
    }

    // MARK: static async startup
    /**
     * Starts up the application.
     * @returns {Promise<void>}
     */
    static async startup() {
        // Setup application insights.
        if (process.env.APPINSIGHTS_CONNECTIONSTRING !== "") {
            Log.setupApplicationInsights(process.env.APPINSIGHTS_CONNECTIONSTRING, {application: "sixgg", container: "sixgg-node"});
        }

        const Db = require("./src/database"),
            Discord = require("./src/discord"),
            Listeners = require("./src/listeners"),
            Twitch = require("./src/twitch");

        Log.info("Starting up...");

        // Set title.
        if (process.platform === "win32") {
            process.title = "Six Gaming";
        } else {
            process.stdout.write("\x1b]2;Six Gaming\x1b\x5c");
        }

        // Setup various listeners.
        Listeners.setup();

        // Startup Twitch.
        try {
            await Twitch.connect();
        } catch (err) {
            // Exit the app.
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
        app.use(compression());
        app.use(cookieParser());

        // Trust proxy to get correct IP from web server.
        app.enable("trust proxy");

        // Setup Twurple EventSub.
        const eventSub = new EventSubMiddleware({
            apiClient: new TwitchClient({
                authProvider: new AppTokenAuthProvider(process.env.TWITCH_CLIENTID, process.env.TWITCH_CLIENTSECRET),
                logger: {
                    colors: false
                }
            }),
            hostName: "six.gg",
            pathPrefix: "/twitch/eventsub",
            secret: process.env.TWITCH_CHANNEL_EVENTSUB_SECRET
        });
        eventSub.apply(/** @type {object} */(app)); // eslint-disable-line @stylistic/no-extra-parens

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
                get: Index.#getMinifyCache,
                set: Index.#setMinifyCache,
                prefix: process.env.REDIS_PREFIX
            } : void 0,
            redirects: Redirects,
            disableTagCombining: !process.env.MINIFY_ENABLED
        });
        app.get("/css", Minify.cssHandler);
        app.get("/js", Minify.jsHandler);

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
            Twitch.setupEventSub();
        });
        Log.info(`Server PID ${process.pid} listening on port ${port}.`);
    }
}

Index.startup().catch((err) => {
    Log.error("Failed to start the application.", {err});
    process.exit(1);
});
