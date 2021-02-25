/**
 * @typedef {import("express").Request} Express.Request
 * @typedef {import("express").Response} Express.Response
 */

const Discord = require("../../src/discord"),
    DiscordUser = require("../../src/discord/user"),
    User = require("../../src/models/user");

//   ###     #            #     #      ####     #                                    #
//  #   #   # #           #     #       #  #                                         #
//  #   #  #   #  #   #  ####   # ##    #  #   ##     ###    ###    ###   # ##    ## #
//  #   #  #   #  #   #   #     ##  #   #  #    #    #      #   #  #   #  ##  #  #  ##
//  #   #  #####  #   #   #     #   #   #  #    #     ###   #      #   #  #      #   #
//  #   #  #   #  #  ##   #  #  #   #   #  #    #        #  #   #  #   #  #      #  ##
//   ###   #   #   ## #    ##   #   #  ####    ###   ####    ###    ###   #       ## #
/**
 * A class that represents the Discord Oauth landing page.
 */
class OAuthDiscord {
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
        const code = req.query.code.toString(),
            state = req.query.state.toString(),
            token = await DiscordUser.getToken(state, code);

        if (!token) {
            res.redirect(302, "/join");
            return;
        }

        const [user, connections] = await Promise.all([
            DiscordUser.getUser(token.access_token),
            DiscordUser.getUserConnections(token.access_token)
        ]);

        if (!user) {
            res.redirect(302, "/join");
            return;
        }

        const guildMember = Discord.findGuildMemberById(user.id);

        if (!guildMember) {
            res.redirect(302, "/join");
            return;
        }

        const sixUser = await User.set(user, guildMember, connections || [], token, req);

        res.cookie("sixGaming", sixUser.session._id, {httpOnly: true});

        res.redirect(302, "/me");
    }
}

OAuthDiscord.route = {
    path: "/oauth/discord"
};

module.exports = OAuthDiscord;
