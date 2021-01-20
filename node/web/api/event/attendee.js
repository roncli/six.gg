/**
 * @typedef {import("express").Request} Express.Request
 * @typedef {import("express").Response} Express.Response
 */

const Attendee = require("../../../src/models/attendee"),
    Log = require("../../../src/logging/log"),
    User = require("../../../src/models/user");

//    #     #      #                       #                  #             #
//   # #    #      #                       #                 # #
//  #   #  ####   ####    ###   # ##    ## #   ###    ###   #   #  # ##    ##
//  #   #   #      #     #   #  ##  #  #  ##  #   #  #   #  #   #  ##  #    #
//  #####   #      #     #####  #   #  #   #  #####  #####  #####  ##  #    #
//  #   #   #  #   #  #  #      #   #  #  ##  #      #      #   #  # ##     #
//  #   #    ##     ##    ###   #   #   ## #   ###    ###   #   #  #       ###
//                                                                 #
//                                                                 #
/**
 * A class that represents the attendee API.
 */
class AttendeeApi {
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
     * @returns {Promise} A promise that resolves when the request is complete.
     */
    static async post(req, res) {
        try {
            const user = await User.getCurrent(req);

            if (!user) {
                res.status(401).json({error: "Unauthorized, you must log in first."});
                return;
            }

            const id = isNaN(Number.parseInt(req.params.id, 10)) ? 0 : Number.parseInt(req.params.id, 10),
                added = await Attendee.add(id, user.id);

            if (!added) {
                res.status(404).json({error: "Not found, could not find an event with this ID."});
                return;
            }

            res.status(201).location(`/event/${id}`).json({eventId: id, userId: user.id});
        } catch (err) {
            res.status(500).json({error: "Server error."});
            Log.exception(`An error occurred while posting to ${req.method} ${AttendeeApi.route.path}.`, err);
        }
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
AttendeeApi.delete = async (req, res) => {
    try {
        const user = await User.getCurrent(req);

        if (!user) {
            res.status(401).json({error: "Unauthorized, you must log in first."});
            return;
        }

        const id = isNaN(Number.parseInt(req.params.id, 10)) ? 0 : Number.parseInt(req.params.id, 10),
            removed = await Attendee.remove(id, user.id);

        if (!removed) {
            res.status(404).json({error: "Not found, could not find an event with this ID."});
            return;
        }

        res.sendStatus(204);
    } catch (err) {
        res.status(500).json({error: "Server error."});
        Log.exception(`An error occurred while posting to ${req.method} ${AttendeeApi.route.path}.`, err);
    }
};

AttendeeApi.route = {
    path: "/api/event/:id/attendee"
};

module.exports = AttendeeApi;
