/**
 * @typedef {import("express").Request} Express.Request
 * @typedef {import("express").Response} Express.Response
 */

const Event = require("../../src/models/event"),
    express = require("express"),
    Log = require("@roncli/node-application-insights-logger"),
    RouterBase = require("hot-router").RouterBase,
    User = require("../../src/models/user");

//  #####                        #       #             #
//  #                            #      # #
//  #      #   #   ###   # ##   ####   #   #  # ##    ##
//  ####   #   #  #   #  ##  #   #     #   #  ##  #    #
//  #       # #   #####  #   #   #     #####  ##  #    #
//  #       # #   #      #   #   #  #  #   #  # ##     #
//  #####    #     ###   #   #    ##   #   #  #       ###
//                                            #
//                                            #
/**
 * A class that represents the event API.
 */
class EventApi extends RouterBase {
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

        route.path = "/api/event/:id";

        route.middleware = [express.json()];

        return route;
    }
}

//    #        ##           #
//    #         #           #
//  ###   ##    #     ##   ###    ##
// #  #  # ##   #    # ##   #    # ##
// #  #  ##     #    ##     #    ##
//  ###   ##   ###    ##     ##   ##
/**
 * Processes the request.
 * @param {Express.Request} req The request.
 * @param {Express.Response} res The response.
 * @returns {Promise} A promise that resolves when the request is complete.
 */
EventApi.delete = async (req, res) => {
    try {
        const user = await User.getCurrent(req);

        if (!user) {
            res.status(401).json({error: "Unauthorized, you must log in first."});
            return;
        }

        const id = isNaN(Number.parseInt(req.params.id, 10)) ? 0 : Number.parseInt(req.params.id, 10),
            removed = await Event.remove(id, user.id);

        if (!removed) {
            res.status(404).json({error: "Not found, could not find an event with this ID owned by this user."});
            return;
        }

        res.sendStatus(204);
    } catch (err) {
        res.status(500).json({error: "Server error."});
        Log.error(`An error occurred while posting to ${req.method} ${EventApi.route.path}.`, {err});
    }
};

module.exports = EventApi;
