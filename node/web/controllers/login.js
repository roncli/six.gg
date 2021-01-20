/**
 * @typedef {import("express").Request} Express.Request
 * @typedef {import("express").Response} Express.Response
 */

const DiscordUser = require("../../src/discord/user"),
    User = require("../../src/models/user");

//  #                      #
//  #
//  #       ###    ## #   ##    # ##
//  #      #   #  #  #     #    ##  #
//  #      #   #   ##      #    #   #
//  #      #   #  #        #    #   #
//  #####   ###    ###    ###   #   #
//                #   #
//                 ###
/**
 * A class that represents the login page.
 */
class Login {
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

        const discordUser = new DiscordUser();
        res.redirect(302, discordUser.getOAuthUrl());
    }
}

Login.route = {
    path: "/login"
};

module.exports = Login;
