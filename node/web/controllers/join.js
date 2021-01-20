/**
 * @typedef {import("express").Request} Express.Request
 * @typedef {import("express").Response} Express.Response
 */

const Common = require("../includes/common"),
    JoinView = require("../../public/views/join"),
    User = require("../../src/models/user");

//    ###           #
//      #
//      #   ###    ##    # ##
//      #  #   #    #    ##  #
//      #  #   #    #    #   #
//  #   #  #   #    #    #   #
//   ###    ###    ###   #   #
/**
 * A class that represents the join page.
 */
class Join {
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

        if (user) {
            res.redirect(302, "/me");
            return;
        }

        res.status(200).send(Common.page(
            "",
            {},
            new JoinView().get(),
            req,
            void 0
        ));
    }
}

Join.route = {
    path: "/join"
};

module.exports = Join;
