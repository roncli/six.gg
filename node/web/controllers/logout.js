/**
 * @typedef {import("express").Request} Express.Request
 * @typedef {import("express").Response} Express.Response
 */

const RouterBase = require("hot-router").RouterBase;

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
class Logout extends RouterBase {
    //                    #
    //                    #
    // ###    ##   #  #  ###    ##
    // #  #  #  #  #  #   #    # ##
    // #     #  #  #  #   #    ##
    // #      ##    ###    ##   ##
    /**
     * Retrieves the route parameters for the class.
     * @returns {RouterBase.Route} The route parameters.
     */
    static get route() {
        const route = {...super.route};

        route.path = "/logout";

        return route;
    }

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

module.exports = Logout;
