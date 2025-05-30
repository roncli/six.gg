/**
 * @typedef {import("express").Request} Express.Request
 * @typedef {import("express").Response} Express.Response
 */

const Common = require("../includes/common"),
    MembersView = require("../../public/views/members"),
    RouterBase = require("hot-router").RouterBase,
    User = require("../../src/models/user");

// MARK: class Members
/**
 * A class that represents the members page.
 */
class Members extends RouterBase {
    // MARK: static get route
    /**
     * Retrieves the route parameters for the class.
     * @returns {RouterBase.Route} The route parameters.
     */
    static get route() {
        const route = {...super.route};

        route.path = "/members";

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
        const user = await User.getCurrent(req),
            members = await User.getMembers();

        res.status(200).send(await Common.page(
            "",
            {css: ["/css/members.css"], js: ["/js/common/connection.js"]},
            MembersView.get(members),
            req,
            user
        ));
    }
}

module.exports = Members;
