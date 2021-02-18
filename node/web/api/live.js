/**
 * @typedef {import("express").Request} Express.Request
 * @typedef {import("express").Response} Express.Response
 */

const DiscordListener = require("../../src/listeners/discord"),
    Log = require("node-application-insights-logger");

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
class LiveApi {
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

LiveApi.route = {
    path: "/api/live"
};

module.exports = LiveApi;
