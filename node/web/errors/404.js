/**
 * @typedef {import("express").Request} Express.Request
 * @typedef {import("express").Response} Express.Response
 */

const Common = require("../includes/common"),
    NotFoundView = require("../../public/views/404"),
    User = require("../../src/models/user");

//  #   #          #     #####                           #
//  #   #          #     #                               #
//  ##  #   ###   ####   #       ###   #   #  # ##    ## #
//  # # #  #   #   #     ####   #   #  #   #  ##  #  #  ##
//  #  ##  #   #   #     #      #   #  #   #  #   #  #   #
//  #   #  #   #   #  #  #      #   #  #  ##  #   #  #  ##
//  #   #   ###     ##   #       ###    ## #  #   #   ## #
/**
 * A class that represents the 404 page.
 */
class NotFound {
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
     * @returns {Promise} A promise that resolves when the request has been processed.
     */
    static async get(req, res) {
        const user = await User.getCurrent(req);

        res.status(404).send(Common.page(
            "",
            {css: ["/css/error.css"]},
            NotFoundView.get({message: "This page does not exist."}),
            req,
            user
        ));
    }
}

NotFound.route = {
    path: "/404"
};

module.exports = NotFound;
