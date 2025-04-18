/**
 * @typedef {import("express").Request} Express.Request
 * @typedef {import("express").Response} Express.Response
 */

const tzdata = require("tzdata"),

    Common = require("../includes/common"),
    Discord = require("../../src/discord"),
    MeView = require("../../public/views/me"),
    RouterBase = require("hot-router").RouterBase,
    User = require("../../src/models/user");

// MARK: class Me
/**
 * A class that represets the me page.
 */
class Me extends RouterBase {
    // MARK: static get route
    /**
     * Retrieves the route parameters for the class.
     * @returns {RouterBase.Route} The route parameters.
     */
    static get route() {
        const route = {...super.route};

        route.path = "/me";

        return route;
    }

    // MARK: static async get
    /**
     * Processes the request.
     * @param {Express.Request} req The request.
     * @param {Express.Response} res The response.
     * @returns {Promise<void>}
     */
    static async get(req, res) {
        const user = await User.getCurrent(req);

        if (!user) {
            res.redirect(302, "/login");
            return;
        }

        const now = new Date();

        res.status(200).send(await Common.page(
            "",
            {css: ["/css/me.css"], js: ["/js/me.js", "/js/common/connection.js"]},
            MeView.get({
                user,
                guildMember: Discord.findGuildMemberById(user.discord.id),
                timezones: Object.keys(tzdata.zones).filter((zone) => {
                    try {
                        now.toLocaleString("en-US", {timeZone: zone});
                        return true;
                    } catch {
                        return false;
                    }
                }).map((zone) => ({
                    zone,
                    time: now.toLocaleTimeString("en-us", {timeZone: zone, timeZoneName: "short"})
                })).sort((a, b) => new Date(now.toLocaleString("en-US", {timeZone: a.zone})).getTime() - new Date(now.toLocaleString("en-US", {timeZone: b.zone})).getTime() || a.zone.localeCompare(b.zone))
            }),
            req,
            user
        ));
    }
}

module.exports = Me;
