/**
 * @typedef {import("express").Request} Express.Request
 * @typedef {import("express").Response} Express.Response
 */

const Discord = require("../../src/discord"),
    DiscordUser = require("../../src/discord/user"),
    RouterBase = require("hot-router").RouterBase,
    User = require("../../src/models/user");

// MARK: class OAuthDiscord
/**
 * A class that represents the Discord Oauth landing page.
 */
class OAuthDiscord extends RouterBase {
    // MARK: static get route
    /**
     * Retrieves the route parameters for the class.
     * @returns {RouterBase.Route} The route parameters.
     */
    static get route() {
        const route = {...super.route};

        route.path = "/oauth/discord";

        return route;
    }

    // MARK: static aysync get
    /**
     * Processes the request.
     * @param {Express.Request} req The request.
     * @param {Express.Response} res The response.
     * @returns {Promise<void>}
     */
    static async get(req, res) {
        const code = req.query.code ? req.query.code.toString() : void 0,
            state = req.query.state ? req.query.state.toString() : void 0;

        if (!code || !state) {
            res.redirect(302, "/join");
            return;
        }

        const token = await DiscordUser.getToken(state, code);

        if (!token) {
            res.redirect(302, "/join");
            return;
        }

        const [user, connections] = await Promise.all([
            DiscordUser.getUser(token.access_token),
            DiscordUser.getUserConnections(token.access_token)
        ]);

        if (!user) {
            res.redirect(302, "/join");
            return;
        }

        const guildMember = Discord.findGuildMemberById(user.id);

        if (!guildMember) {
            res.redirect(302, "/join");
            return;
        }

        const sixUser = await User.set(user, guildMember, connections || [], token, req);

        res.cookie("sixGaming", sixUser.session._id, {httpOnly: true});

        res.redirect(302, "/me");
    }
}

module.exports = OAuthDiscord;
