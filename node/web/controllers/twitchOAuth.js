/**
 * @typedef {import("express").Request} Express.Request
 * @typedef {import("express").Response} Express.Response
 */

const Common = require("../includes/common"),
    Discord = require("../../src/discord"),
    Log = require("@roncli/node-application-insights-logger"),
    NotFoundView = require("../../public/views/404"),
    RouterBase = require("hot-router").RouterBase,
    ServerErrorView = require("../../public/views/500"),
    Twitch = require("../../src/twitch"),
    TwitchDb = require("../../src/database/twitch"),
    TwitchOAuthView = require("../../public/views/twitchOAuth"),
    User = require("../../src/models/user");

// MARK: class TwitchOAuth
/**
 * A class that represets the Twitch OAuth page.
 */
class TwitchOAuth extends RouterBase {
    // MARK: static get route
    /**
     * Retrieves the route parameters for the class.
     * @returns {RouterBase.Route} The route parameters.
     */
    static get route() {
        const route = {...super.route};

        route.path = "/twitch/oauth";

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

        const code = req.query.code,
            state = req.query.state;

        if (state !== Twitch.state) {
            Log.error("States don't match.", {err: new Error("States don't match."), req, properties: {incomingState: state, storedState: Twitch.state}});
            res.status(500).send(await Common.page(
                "",
                {css: ["/css/error.css"]},
                ServerErrorView.get(),
                req,
                user
            ));
            return;
        }

        let response;
        try {
            response = await fetch(`https://id.twitch.tv/oauth2/token?client_id=${process.env.TWITCH_CLIENTID}&client_secret=${process.env.TWITCH_CLIENTSECRET}&code=${code}&grant_type=authorization_code&redirect_uri=${process.env.TWITCH_REDIRECT_URI}`, {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                signal: AbortSignal.timeout(30000)
            });
        } catch (err) {
            Log.error("Error while obtaining Twitch tokens.", {err, req});
            res.status(500).send(await Common.page(
                "",
                {css: ["/css/error.css"]},
                ServerErrorView.get(),
                req,
                user
            ));
            return;
        }

        if (response.status !== 200) {
            Log.error("Invalid response from Twitch.", {err: new Error("Invalid response from Twitch"), req, properties: {body: response.body}});
            res.status(500).send(await Common.page(
                "",
                {css: ["/css/error.css"]},
                ServerErrorView.get(),
                req,
                user
            ));
            return;
        }

        let tokens;
        try {
            tokens = await TwitchDb.get();
        } catch (err) {
            Log.error("There was an error getting the Twitch tokens from the database.", {err, req});
            res.status(500).send(await Common.page(
                "",
                {css: ["/css/error.css"]},
                ServerErrorView.get(),
                req,
                user
            ));
            return;
        }

        if (!tokens || !tokens.channelAccessToken || !tokens.channelRefreshToken || !tokens.botAccessToken || !tokens.botRefreshToken) {
            tokens = {
                botAccessToken: process.env.TWITCH_BOT_ACCESSTOKEN,
                botRefreshToken: process.env.TWITCH_BOT_REFRESHTOKEN,
                channelAccessToken: process.env.TWITCH_CHANNEL_ACCESSTOKEN,
                channelRefreshToken: process.env.TWITCH_CHANNEL_REFRESHTOKEN
            };
        }

        const body = await response.json(),
            accessToken = body.access_token,
            refreshToken = body.refresh_token,
            scope = body.scope;

        if (scope.filter((s) => process.env.TWITCH_CHANNEL_SCOPES.split(" ").indexOf(s) === -1).length === 0 && process.env.TWITCH_CHANNEL_SCOPES.split(" ").filter((s) => scope.indexOf(s) === -1).length === 0) {
            tokens.channelAccessToken = accessToken;
            tokens.channelRefreshToken = refreshToken;
        } else if (scope.filter((s) => process.env.TWITCH_BOT_SCOPES.split(" ").indexOf(s) === -1).length === 0 && process.env.TWITCH_BOT_SCOPES.split(" ").filter((s) => scope.indexOf(s) === -1).length === 0) {
            tokens.botAccessToken = accessToken;
            tokens.botRefreshToken = refreshToken;
        } else {
            Log.error("Could not determine tokens to replace.", {err: new Error("Could not determine tokens to replace."), req, properties: {body: response.body}});
            res.status(500).send(await Common.page(
                "",
                {css: ["/css/error.css"]},
                ServerErrorView.get(),
                req,
                user
            ));
            return;
        }

        try {
            await TwitchDb.set(tokens);
        } catch (err) {
            Log.error("There was an error setting the Twitch tokens in the database.", {err, req});
            res.status(500).send(await Common.page(
                "",
                {css: ["/css/error.css"]},
                ServerErrorView.get(),
                req,
                user
            ));
            return;
        }

        try {
            await Twitch.logout();
            await Twitch.connect();
            await Twitch.login();
        } catch (err) {
            Log.error("Error logging in.", {err, req});
            res.status(500).send(await Common.page(
                "",
                {css: ["/css/error.css"]},
                ServerErrorView.get(),
                req,
                user
            ));
            return;
        }

        res.status(200).send(await Common.page(
            "",
            {},
            TwitchOAuthView.get(),
            req,
            user
        ));

    }
}

module.exports = TwitchOAuth;
