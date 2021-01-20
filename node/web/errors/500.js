/**
 * @typedef {import("express").Request} Express.Request
 * @typedef {import("express").Response} Express.Response
 */

const Common = require("../includes/common"),
    ServerErrorView = require("../../public/views/500"),
    User = require("../../src/models/user");

//   ###                                      #####
//  #   #                                     #
//  #       ###   # ##   #   #   ###   # ##   #      # ##   # ##    ###   # ##
//   ###   #   #  ##  #  #   #  #   #  ##  #  ####   ##  #  ##  #  #   #  ##  #
//      #  #####  #       # #   #####  #      #      #      #      #   #  #
//  #   #  #      #       # #   #      #      #      #      #      #   #  #
//   ###    ###   #        #     ###   #      #####  #      #       ###   #
/**
 * A class that represents the 500 page.
 */
class ServerError {
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
        let user;
        try {
            user = await User.getCurrent(req);
        } catch (err) {}

        res.status(500).send(Common.page(
            "",
            {css: ["/css/error.css"]},
            new ServerErrorView().get(),
            req,
            user
        ));
    }
}

ServerError.route = {
    path: "/500"
};

module.exports = ServerError;
