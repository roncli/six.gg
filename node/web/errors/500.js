/**
 * @typedef {import("express").Request} Express.Request
 * @typedef {import("express").Response} Express.Response
 */

const Common = require("../includes/common"),
    RouterBase = require("hot-router").RouterBase,
    ServerErrorView = require("../../public/views/500"),
    User = require("../../src/models/user");

// MARK: class ServerError
/**
 * A class that represents the 500 page.
 */
class ServerError extends RouterBase {
    // MARK: static get route
    /**
     * Retrieves the route parameters for the class.
     * @returns {RouterBase.Route} The route parameters.
     */
    static get route() {
        const route = {...super.route};

        route.serverError = true;

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
        let user;
        try {
            user = await User.getCurrent(req);
        } catch (err) {}

        res.status(500).send(await Common.page(
            "",
            {css: ["/css/error.css"]},
            ServerErrorView.get(),
            req,
            user
        ));
    }
}

module.exports = ServerError;
