/**
 * @typedef {import("express").Request} Express.Request
 * @typedef {import("express").Response} Express.Response
 */

const HotRouter = require("hot-router");

// MARK: class Logout
/**
 * A class that represents the logout page.
 */
class Logout extends HotRouter.RouterBase {
    // MARK: static get route
    /**
     * Retrieves the route parameters for the class.
     * @returns {HotRouter.RouterBase.Route} The route parameters.
     */
    static get route() {
        const route = {...super.route};

        route.path = "/logout";

        return route;
    }

    // MARK: static get
    /**
     * Processes the request.
     * @param {Express.Request} _req The request.
     * @param {Express.Response} res The response.
     * @returns {void}
     */
    static get(_req, res) {
        res.clearCookie("sixGaming");
        res.redirect(302, "/");
    }
}

module.exports = Logout;
