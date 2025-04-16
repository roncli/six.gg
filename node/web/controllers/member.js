/**
 * @typedef {import("express").Request} Express.Request
 * @typedef {import("express").Response} Express.Response
 */

const Common = require("../includes/common"),
    MemberView = require("../../public/views/member"),
    NotFoundView = require("../../public/views/404"),
    RouterBase = require("hot-router").RouterBase,
    User = require("../../src/models/user");

// MARK: class Member
/**
 * A class that represents the member page.
 */
class Member extends RouterBase {
    // MARK: static get route
    /**
     * Retrieves the route parameters for the class.
     * @returns {RouterBase.Route} The route parameters.
     */
    static get route() {
        const route = {...super.route};

        route.path = "/member/:id/:name";

        return route;
    }

    // MARK: static async get
    /**
     * Processes the request.
     * @param {Express.Request} req The request.
     * @param {Express.Response} res The response.
     * @returns {Promise} A promise that resolves when the request is processed.
     */
    static async get(req, res) {
        const user = await User.getCurrent(req),
            id = isNaN(+req.params.id) || isNaN(parseFloat(req.params.id)) ? 0 : parseInt(req.params.id, 10);

        if (!id) {
            res.status(404).send(await Common.page(
                "",
                {css: ["/css/error.css"]},
                NotFoundView.get({message: "This page does not exist."}),
                req,
                user
            ));
            return;
        }

        const member = await User.getMember(id);

        if (!member || !member.user || !member.guildMember) {
            res.status(404).send(await Common.page(
                "",
                {css: ["/css/error.css"]},
                NotFoundView.get({message: "This page does not exist."}),
                req,
                user
            ));
            return;
        }

        res.status(200).send(await Common.page(
            "",
            {css: ["/css/member.css"], js: ["/js/common/connection.js"]},
            MemberView.get(member),
            req,
            user
        ));
    }
}

module.exports = Member;
