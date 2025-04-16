/**
 * @typedef {import("express").Request} Express.Request
 * @typedef {import("express").Response} Express.Response
 */

const CalendarView = require("../../public/views/calendar"),
    Common = require("../includes/common"),
    RouterBase = require("hot-router").RouterBase,
    User = require("../../src/models/user");

// MARK: class Calendar
/**
 * A class that represents the calendar page.
 */
class Calendar extends RouterBase {
    // MARK: static get route
    /**
     * Retrieves the route parameters for the class.
     * @returns {RouterBase.Route} The route parameters.
     */
    static get route() {
        const route = {...super.route};

        route.path = "/calendar";

        return route;
    }

    // MARK: static async get
    /**
     * Processes the request.
     * @param {Express.Request} req The request.
     * @param {Express.Response} res The response.
     * @returns {Promise} A promise that resolves when the request is processed.
     */
    static async get(req, res) {
        const user = await User.getCurrent(req);

        res.status(200).send(await Common.page(
            "",
            {
                css: ["/css/fullcalendar.css", "/css/modal.css", "/css/calendar.css"],
                js: ["/js/fullcalendar/core.js", "/js/fullcalendar/daygrid.js", "/js/common/modal.js", "/js/common/template.js", "/js/calendar.js"]
            },
            CalendarView.get({timezone: user && user.timezone ? user.timezone : process.env.DEFAULT_TIMEZONE, defaultTimezone: !(user && user.timezone)}),
            req,
            user
        ));
    }
}

module.exports = Calendar;
