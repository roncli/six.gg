/**
 * @typedef {import("express").Request} Express.Request
 * @typedef {import("express").Response} Express.Response
 */

const Common = require("../includes/common"),
    MemberView = require("../../public/views/member"),
    NotFoundView = require("../../public/views/404"),
    User = require("../../src/models/user");

//  #   #                #
//  #   #                #
//  ## ##   ###   ## #   # ##    ###   # ##
//  # # #  #   #  # # #  ##  #  #   #  ##  #
//  #   #  #####  # # #  #   #  #####  #
//  #   #  #      # # #  ##  #  #      #
//  #   #   ###   #   #  # ##    ###   #
/**
 * A class that represents the member page.
 */
class Member {
    //              #
    //              #
    //  ###   ##   ###
    // #  #  # ##   #
    //  ##   ##     #
    // #      ##     ##
    //  ###
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
            res.status(404).send(Common.page(
                "",
                {css: ["/css/error.css"]},
                new NotFoundView().get({message: "This page does not exist."}),
                req,
                user
            ));
            return;
        }

        const member = await User.getMember(id);

        res.status(200).send(Common.page(
            "",
            {css: ["/css/member.css"], js: ["/js/common/connection.js"]},
            new MemberView().get(member),
            req,
            user
        ));
    }
}

Member.route = {
    path: "/member/:id/:name"
};

module.exports = Member;
