/**
 * @typedef {import("express").Request} Express.Request
 * @typedef {import("express").Response} Express.Response
 */

const Common = require("../includes/common"),
    JoinView = require("../../public/views/join"),
    RouterBase = require("hot-router").RouterBase,
    User = require("../../src/models/user");

// MARK: class Join
/**
 * A class that represents the join page.
 */
class Join extends RouterBase {
    // MARK: static get route
    /**
     * Retrieves the route parameters for the class.
     * @returns {RouterBase.Route} The route parameters.
     */
    static get route() {
        const route = {...super.route};

        route.path = "/join";

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

        if (user) {
            res.redirect(302, "/me");
            return;
        }

        res.status(200).send(await Common.page(
            "",
            {},
            JoinView.get(),
            req,
            void 0
        ));
    }
}

module.exports = Join;
