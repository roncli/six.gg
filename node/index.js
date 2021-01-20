const bodyParser = require("body-parser"),
    compression = require("compression"),
    cookieParser = require("cookie-parser"),
    express = require("express"),
    Minify = require("./src/minify"),

    Cache = require("./src/redis/cache"),
    Discord = require("./src/discord"),
    Listeners = require("./src/listeners"),
    Log = require("./src/logging/log"),
    Redirects = require("./src/redirects"),
    Router = require("./src/router"),
    Twitch = require("./src/twitch");

process.on("unhandledRejection", (reason) => {
    Log.exception("Unhandled promise rejection caught.", reason);
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
    Log.log("Starting up...");

    // Set title.
    if (process.platform === "win32") {
        process.title = "Six Gaming";
    } else {
        process.stdout.write("\x1b]2;Six Gaming\x1b\x5c");
    }

    // Setup express app.
    const app = express();

    // Get the router.
    const router = new Router();
    try {
        await router.setup();
    } catch (err) {
        console.log(err);
        return;
    }

    // Setup various listeners.
    Listeners.setup();

    // Startup Discord.
    Discord.startup();
    await Discord.connect();

    // Startup Twitch.
    await Twitch.connect();

    // Flush cache.
    await Cache.flush();

    // Initialize middleware stack.
    app.use(bodyParser.json());
    app.use(compression());
    app.use(cookieParser());

    // Setup public redirects.
    app.use(express.static("public"));

    // Set req.ip.
    app.use((req, res, next) => {
        req.ip = (req.headers["x-forwarded-for"] ? req.headers["x-forwarded-for"].toString() : void 0) || req.ip;
        next();
    });

    // Setup Discord redirect.
    app.get("/discord", (req, res) => {
        res.redirect(process.env.SIXGG_DISCORD_URL);
    });

    // Setup JS/CSS handlers.
    const minify = new Minify();
    app.get("/css", minify.cssHandler);
    app.get("/js", minify.jsHandler);

    // Setup redirect routes.
    app.get("*", (req, res, next) => {
        const redirect = Redirects[req.path];
        if (!redirect) {
            next();
            return;
        }

        res.status(200).contentType(redirect.contentType).sendFile(`${__dirname}/${redirect.path}`);
    });

    // tsconfig.json is not meant to be served, 404 it if it's requested directly.
    app.use("/tsconfig.json", (req, res, next) => {
        req.method = "GET";
        req.url = "/404";
        router.router(req, res, next);
    });

    // 500 is an internal route, 404 it if it's requested directly.
    app.use("/500", (req, res, next) => {
        req.method = "GET";
        req.url = "/404";
        router.router(req, res, next);
    });

    // Setup dynamic routing.
    app.use("/", router.router);

    // 404 remaining pages.
    app.use((req, res, next) => {
        req.method = "GET";
        req.url = "/404";
        router.router(req, res, next);
    });

    // 500 errors.
    app.use((err, req, res, next) => {
        Log.exception("Unhandled error has occurred.", err);
        req.method = "GET";
        req.url = "/500";
        router.router(req, res, next);
    });

    // Startup web server.
    const port = process.env.PORT || 3030;

    app.listen(port);
    console.log(`Server PID ${process.pid} listening on port ${port}.`);
}());
