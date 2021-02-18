/**
 * @typedef {import("express").Request} Express.Request
 * @typedef {import("express").Response} Express.Response
 */

const Log = require("node-application-insights-logger"),
    Twitch = require("../../src/twitch"),
    User = require("../../src/models/user");

/** @type {{[x: string]: number}} */
const throttle = {};

//   ###                                 #             #
//  #   #                               # #
//  #       ###   ## #    ###    ###   #   #  # ##    ##
//  #          #  # # #  #   #  #      #   #  ##  #    #
//  #  ##   ####  # # #  #####   ###   #####  ##  #    #
//  #   #  #   #  # # #  #          #  #   #  # ##     #
//   ###    ####  #   #   ###   ####   #   #  #       ###
//                                            #
//                                            #
/**
 * A class that represents the games API.
 */
class GamesApi {
    //                     #
    //                     #
    // ###    ##    ###   ###
    // #  #  #  #  ##      #
    // #  #  #  #    ##    #
    // ###    ##   ###      ##
    // #
    /**
     * Processes the request.
     * @param {Express.Request} req The request.
     * @param {Express.Response} res The response.
     * @returns {Promise} A promises that resolves when the request has been processed.
     */
    static async post(req, res) {
        try {
            if (throttle[req.ip] && new Date().getTime() < throttle[req.ip]) {
                res.status(429).json({error: "You are being throttled.  Try again in one minute."});
                throttle[req.ip] = new Date().getTime() + 60 * 1000;
                return;
            }

            throttle[req.ip] = new Date().getTime() + 250;

            if (!req.body && !req.body.search) {
                res.status(400).json({error: "Bad request, you must send a body with a search request in it."});
                return;
            }

            const user = await User.getCurrent(req);

            if (!user) {
                res.status(401).json({error: "Unauthorized, you must log in first."});
                return;
            }

            const games = await Twitch.searchGameList(req.body.search);

            res.status(200).json(games.sort((a, b) => a.name.localeCompare(b.name)).map((game) => ({
                id: game.id,
                game: game.name,
                imageUrl: game.cover ? `https://${game.cover.url}` : void 0
            })));
        } catch (err) {
            res.status(500).json({error: "Server error."});
            Log.error(`An error occurred while posting to ${req.method} ${GamesApi.route.path}.`, {err});
        }
    }
}

GamesApi.route = {
    path: "/api/games"
};

module.exports = GamesApi;
