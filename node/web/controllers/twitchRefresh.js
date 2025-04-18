/**
 * @typedef {import("express").Request} Express.Request
 * @typedef {import("express").Response} Express.Response
 */

const Common = require("../includes/common"),
    crypto = require("crypto"),
    Discord = require("../../src/discord"),
    NotFoundView = require("../../public/views/404"),
    promisify = require("util").promisify,
    RouterBase = require("hot-router").RouterBase,
    Twitch = require("../../src/twitch"),
    TwitchRefreshView = require("../../public/views/twitchRefresh"),
    User = require("../../src/models/user");

// MARK: class TwitchRefresh
/**
 * A class that represets the Twitch refresh page.
 */
class TwitchRefresh extends RouterBase {
    // MARK: static get route
    /**
     * Retrieves the route parameters for the class.
     * @returns {RouterBase.Route} The route parameters.
     */
    static get route() {
        const route = {...super.route};

        route.path = "/twitch/refresh";

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

        let member;
        if (user && user.discord && user.discord.id) {
            member = Discord.findGuildMemberById(user.discord.id);
        }

        if (!user || !user.discord || !member || !Discord.isOwner(member)) {
            res.status(404).send(await Common.page(
                "",
                {css: ["/css/error.css"]},
                NotFoundView.get({message: "This page does not exist."}),
                req,
                user
            ));
            return;
        }

        Twitch.state = (await promisify(crypto.randomBytes)(32)).toString("hex");

        res.status(200).send(await Common.page(
            "",
            {},
            TwitchRefreshView.get(process.env.TWITCH_CLIENTID, process.env.TWITCH_REDIRECT_URI, process.env.TWITCH_CHANNEL_SCOPES, process.env.TWITCH_BOT_SCOPES, Twitch.state),
            req,
            user
        ));
    }

}

module.exports = TwitchRefresh;
