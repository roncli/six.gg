/**
 * @typedef {import("express").Request} Express.Request
 * @typedef {import("express").Response} Express.Response
 */

const DiscordListener = require("../../src/listeners/discord"),
    Log = require("node-application-insights-logger"),
    RouterBase = require("hot-router").RouterBase;

//  #        #                    #             #
//  #                            # #
//  #       ##    #   #   ###   #   #  # ##    ##
//  #        #    #   #  #   #  #   #  ##  #    #
//  #        #     # #   #####  #####  ##  #    #
//  #        #     # #   #      #   #  # ##     #
//  #####   ###     #     ###   #   #  #       ###
//                                     #
//                                     #
/**
 * A class that represents the live API.
 */
class LiveApi extends RouterBase {
    //                    #
    //                    #
    // ###    ##   #  #  ###    ##
    // #  #  #  #  #  #   #    # ##
    // #     #  #  #  #   #    ##
    // #      ##    ###    ##   ##
    /**
     * Retrieves the route parameters for the class.
     * @returns {RouterBase.Route} The route parameters.
     */
    static get route() {
        const route = {...super.route};

        route.path = "/api/live";

        return route;
    }

    //              #
    //              #
    //  ###   ##   ###
    // #  #  # ##   #
    //  ##   ##     #
    // #      ##     ##
    //  ###
    /**
     * Processes the request.
     * @param {Express.Request} req The request.
     * @param {Express.Response} res The response.
     * @returns {void}
     */
    static get(req, res) {
        try {
            const streamers = Array.from(DiscordListener.streamers.streamers.values()),
                featured = DiscordListener.streamers.streamers.get(DiscordListener.streamers.featured);

            if (featured) {
                streamers.splice(streamers.indexOf(featured), 1);
                streamers.unshift(featured);
            }

            res.status(200).json(streamers);
        } catch (err) {
            res.status(500).json({error: "Server error."});
            Log.error(`An error occurred while posting to ${req.method} ${LiveApi.route.path}.`, {err});
        }
    }
}

module.exports = LiveApi;
