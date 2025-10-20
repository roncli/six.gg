/**
 * @typedef {import("express").Request} Express.Request
 * @typedef {import("express").Response} Express.Response
 */

const Redirects = require("../../src/redirects"),
    RouterBase = require("hot-router").RouterBase;

// MARK: Redirect
/**
 * A class that represents the redirect controller.
 */
class Redirect extends RouterBase {
    // MARK: static get route
    /**
     * Retrieves the route parameters for the class.
     * @returns {RouterBase.Route} The route parameters.
     */
    static get route() {
        const route = {...super.route};

        route.catchAll = true;

        return route;
    }

    // MARK: static async get
    /**
     * Processes the request.
     * @param {Express.Request} req The request.
     * @param {Express.Response} res The response.
     * @param {Function} next The next middleware function.
     * @returns {void}
     */
    static get(req, res, next) {
        // Implement the logic for processing the request
        const redirect = Redirects[req.path];
        if (!redirect) {
            next();
            return;
        }

        res.status(200).contentType(redirect.contentType).sendFile(`${redirect.path}`);
    }
}

module.exports = Redirect;
