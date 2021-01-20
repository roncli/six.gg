/**
 * @typedef {import("express").Request} Express.Request
 * @typedef {import("express").Response} Express.Response
 */

const Common = require("../includes/common"),
    Event = require("../../src/models/event"),
    EventView = require("../../public/views/event"),
    NotFoundView = require("../../public/views/404"),
    User = require("../../src/models/user");

//  #####                        #      ###                  #                    ##     ##
//  #                            #     #   #                 #                     #      #
//  #      #   #   ###   # ##   ####   #       ###   # ##   ####   # ##    ###     #      #     ###   # ##
//  ####   #   #  #   #  ##  #   #     #      #   #  ##  #   #     ##  #  #   #    #      #    #   #  ##  #
//  #       # #   #####  #   #   #     #      #   #  #   #   #     #      #   #    #      #    #####  #
//  #       # #   #      #   #   #  #  #   #  #   #  #   #   #  #  #      #   #    #      #    #      #
//  #####    #     ###   #   #    ##    ###    ###   #   #    ##   #       ###    ###    ###    ###   #
/**
 * A class that represents the event page.
 */
class EventController {
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
     * @returns {Promise} A promise that resolves when the request is processed.
     */
    static async get(req, res) {
        const user = await User.getCurrent(req),
            id = isNaN(Number.parseInt(req.params.id, 10)) ? 0 : Number.parseInt(req.params.id, 10);

        if (id === 0) {
            res.status(404).send(Common.page(
                "",
                {css: ["/css/error.css"]},
                new NotFoundView().get({message: "This page does not exist."}),
                req,
                user
            ));
            return;
        }

        const event = await Event.get(id);

        if (!event) {
            res.status(404).send(Common.page(
                "",
                {css: ["/css/error.css"]},
                new NotFoundView().get({message: "This page does not exist."}),
                req,
                user
            ));
            return;
        }

        const [eventUser, attendees] = await Promise.all([User.getMember(event.userId), User.getByEventAttendees(event.id)]);

        res.status(200).send(Common.page(
            "",
            {css: ["/css/event.css"], js: ["/js/event.js"]},
            new EventView().get({event, user, eventUser: eventUser.user, guildMember: eventUser.guildMember, attendees}),
            req,
            user
        ));
    }
}

EventController.route = {
    path: "/event/:id"
};

module.exports = EventController;
