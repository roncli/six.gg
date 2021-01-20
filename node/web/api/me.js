/**
 * @typedef {import("express").Request} Express.Request
 * @typedef {import("express").Response} Express.Response
 */

const tzdata = require("tzdata"),

    Log = require("../../src/logging/log"),
    User = require("../../src/models/user");

//  #   #           #             #
//  #   #          # #
//  ## ##   ###   #   #  # ##    ##
//  # # #  #   #  #   #  ##  #    #
//  #   #  #####  #####  ##  #    #
//  #   #  #      #   #  # ##     #
//  #   #   ###   #   #  #       ###
//                       #
//                       #
/**
 * A class that represents the me API.
 */
class MeApi {
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
            if (!req.body) {
                res.status(400).json({error: "Bad request, you must send a body."});
                return;
            }

            const user = await User.getCurrent(req);

            if (!user) {
                res.status(401).json({error: "Unauthorized, you must log in first."});
                return;
            }

            const update = {};

            if (req.body.location !== void 0) {
                update.location = req.body.location || "";
            }

            if (req.body.timezone !== void 0) {
                if (!tzdata.zones[req.body.timezone]) {
                    res.status(400).json({error: "Bad request, the timezone is invalid."});
                    return;
                }

                try {
                    new Date().toLocaleString("en-US", {timeZone: req.body.timezone, hour12: true, hour: "numeric", minute: "2-digit", timeZoneName: "short"});
                } catch (err) {
                    res.status(400).json({error: "Bad request, the timezone is invalid."});
                    return;
                }

                update.timezone = req.body.timezone;
            }

            user.set(update);

            res.sendStatus(204);
        } catch (err) {
            res.status(500).json({error: "Server error."});
            Log.exception(`An error occurred while posting to ${req.method} ${MeApi.route.path}.`, err);
        }
    }
}

MeApi.route = {
    path: "/api/me"
};

module.exports = MeApi;
