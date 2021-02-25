/**
 * @typedef {import("express").Request} Express.Request
 * @typedef {import("express").Response} Express.Response
 */

const tzdata = require("tzdata"),

    Common = require("../includes/common"),
    Discord = require("../../src/discord"),
    MeView = require("../../public/views/me"),
    User = require("../../src/models/user");

//  #   #
//  #   #
//  ## ##   ###
//  # # #  #   #
//  #   #  #####
//  #   #  #
//  #   #   ###
/**
 * A class that represets the me page.
 */
class Me {
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
     * @returns {Promise} A promise that resolves when the request has been processed.
     */
    static async get(req, res) {
        const user = await User.getCurrent(req);

        if (!user) {
            res.redirect(302, "/login");
            return;
        }

        const now = new Date();

        res.status(200).send(Common.page(
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

Me.route = {
    path: "/me"
};

module.exports = Me;
