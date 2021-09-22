/**
 * @typedef {import("express").Request} Express.Request
 * @typedef {import("express").Response} Express.Response
 */

const Common = require("../includes/common"),
    Event = require("../../src/models/event"),
    EventView = require("../../public/views/event"),
    NotFoundView = require("../../public/views/404"),
    RouterBase = require("hot-router").RouterBase,
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
class EventController extends RouterBase {
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

        route.path = "/event/:id";

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
     * @returns {Promise} A promise that resolves when the request is processed.
     */
    static async get(req, res) {
        const user = await User.getCurrent(req),
            id = isNaN(Number.parseInt(req.params.id, 10)) ? 0 : Number.parseInt(req.params.id, 10);

        if (id === 0) {
            res.status(404).send(await Common.page(
                "",
                {css: ["/css/error.css"]},
                NotFoundView.get({message: "This page does not exist."}),
                req,
                user
            ));
            return;
        }

        const event = await Event.get(id);

        if (!event) {
            res.status(404).send(await Common.page(
                "",
                {css: ["/css/error.css"]},
                NotFoundView.get({message: "This page does not exist."}),
                req,
                user
            ));
            return;
        }

        const [eventUser, attendees] = await Promise.all([User.getMember(event.userId), User.getByEventAttendees(event.id)]);

        res.status(200).send(await Common.page(
            "",
            {css: ["/css/event.css"], js: ["/js/event.js"]},
            EventView.get({event, user, eventUser: eventUser.user, guildMember: eventUser.guildMember, attendees}),
            req,
            user
        ));
    }
}

module.exports = EventController;
