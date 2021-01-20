/**
 * @typedef {import("express").Request} Express.Request
 * @typedef {import("express").Response} Express.Response
 */

const Common = require("../includes/common"),
    MembersView = require("../../public/views/members"),
    User = require("../../src/models/user");

//  #   #                #
//  #   #                #
//  ## ##   ###   ## #   # ##    ###   # ##    ###
//  # # #  #   #  # # #  ##  #  #   #  ##  #  #
//  #   #  #####  # # #  #   #  #####  #       ###
//  #   #  #      # # #  ##  #  #      #          #
//  #   #   ###   #   #  # ##    ###   #      ####
/**
 * A class that represents the members page.
 */
class Members {
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
            members = await User.getMembers();

        res.status(200).send(Common.page(
            "",
            {css: ["/css/members.css"], js: ["/js/common/connection.js"]},
            new MembersView().get(members),
            req,
            user
        ));
    }
}

Members.route = {
    path: "/members"
};

module.exports = Members;
