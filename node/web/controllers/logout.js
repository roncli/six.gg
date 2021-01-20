/**
 * @typedef {import("express").Request} Express.Request
 * @typedef {import("express").Response} Express.Response
 */

//  #                                   #
//  #                                   #
//  #       ###    ## #   ###   #   #  ####
//  #      #   #  #  #   #   #  #   #   #
//  #      #   #   ##    #   #  #   #   #
//  #      #   #  #      #   #  #  ##   #  #
//  #####   ###    ###    ###    ## #    ##
//                #   #
//                 ###
/**
 * A class that represents the logout page.
 */
class Logout {
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
     * @returns {void}
     */
    static get(req, res) {
        res.clearCookie("sixGaming");
        res.redirect(302, "/");
    }
}

Logout.route = {
    path: "/logout"
};

module.exports = Logout;
