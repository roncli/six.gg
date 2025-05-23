/**
 * @typedef {import("express").Request} Express.Request
 * @typedef {import("express").Response} Express.Response
 */

const express = require("express"),
    Log = require("@roncli/node-application-insights-logger"),
    RouterBase = require("hot-router").RouterBase,
    Twitch = require("../../src/twitch"),
    User = require("../../src/models/user");

// MARK: class GamesApi
/**
 * A class that represents the games API.
 */
class GamesApi extends RouterBase {
    /** @type {{[x: string]: number}} */
    static #throttle = {};

    // MARK: static get route
    /**
     * Retrieves the route parameters for the class.
     * @returns {RouterBase.Route} The route parameters.
     */
    static get route() {
        const route = {...super.route};

        route.path = "/api/games";

        route.middleware = [express.json()];

        return route;
    }

    // MARK: static async post
    /**
     * Processes the request.
     * @param {Express.Request} req The request.
     * @param {Express.Response} res The response.
     * @returns {Promise<void>}
     */
    static async post(req, res) {
        try {
            if (GamesApi.#throttle[req.ip] && new Date().getTime() < GamesApi.#throttle[req.ip]) {
                res.status(429).json({error: "You are being throttled.  Try again in one minute."});
                GamesApi.#throttle[req.ip] = new Date().getTime() + 60 * 1000;
                return;
            }

            GamesApi.#throttle[req.ip] = new Date().getTime() + 250;

            if (!req.body || !req.body.search) {
                res.status(400).json({error: "Bad request, you must send a body with a search request in it."});
                return;
            }

            const user = await User.getCurrent(req);

            if (!user) {
                res.status(401).json({error: "Unauthorized, you must log in first."});
                return;
            }

            const games = await Twitch.searchGameList(req.body.search);

            res.status(200).json(games.sort((a, b) => a.name.localeCompare(b.name)).map((game) => ({
                id: game.id,
                game: game.name,
                imageUrl: game.cover ? `https://${game.cover.url}` : void 0
            })));
        } catch (err) {
            res.status(500).json({error: "Server error."});
            Log.error(`An error occurred while posting to ${req.method} ${GamesApi.route.path}.`, {err});
        }
    }
}

module.exports = GamesApi;
