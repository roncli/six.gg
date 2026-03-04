/**
 * @typedef {import("express").Request} Express.Request
 * @typedef {import("express").Response} Express.Response
 */

const Common = require("../includes/common"),
    HotRouter = require("hot-router"),
    ServerErrorView = require("../../public/views/500"),
    User = require("../../src/models/user");

// MARK: class ServerError
/**
 * A class that represents the 500 page.
 */
class ServerError extends HotRouter.RouterBase {
    // MARK: static get route
    /**
     * Retrieves the route parameters for the class.
     * @returns {HotRouter.RouterBase.Route} The route parameters.
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
     * @returns {Promise<void>}
     */
    static async get(req, res) {
        let user;
        try {
            user = await User.getCurrent(req);
        } catch { } // eslint-disable-line no-empty -- It doesn't matter if this fails, having the user object is optional.

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
