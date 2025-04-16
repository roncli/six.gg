/**
 * @typedef {import("express").Request} Express.Request
 * @typedef {import("express").Response} Express.Response
 */

const DiscordUser = require("../../src/discord/user"),
    RouterBase = require("hot-router").RouterBase,
    User = require("../../src/models/user");

// MARK: class Login
/**
 * A class that represents the login page.
 */
class Login extends RouterBase {
    // MARK: static get route
    /**
     * Retrieves the route parameters for the class.
     * @returns {RouterBase.Route} The route parameters.
     */
    static get route() {
        const route = {...super.route};

        route.path = "/login";

        return route;
    }

    // MARK: static async get
    /**
     * Processes the request.
     * @param {Express.Request} req The request.
     * @param {Express.Response} res The response.
     * @returns {Promise} A promise that resolves when the request has been processed.
     */
    static async get(req, res) {
        const user = await User.getCurrent(req);

        if (user) {
            res.redirect(302, "/me");
            return;
        }

        res.redirect(302, DiscordUser.getOAuthUrl());
    }
}

module.exports = Login;
