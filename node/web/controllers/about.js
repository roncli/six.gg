/**
 * @typedef {import("express").Request} Express.Request
 * @typedef {import("express").Response} Express.Response
 */

const AboutView = require("../../public/views/about"),
    Common = require("../includes/common"),
    RouterBase = require("hot-router").RouterBase,
    User = require("../../src/models/user");

//    #    #                     #
//   # #   #                     #
//  #   #  # ##    ###   #   #  ####
//  #   #  ##  #  #   #  #   #   #
//  #####  #   #  #   #  #   #   #
//  #   #  ##  #  #   #  #  ##   #  #
//  #   #  # ##    ###    ## #    ##
/**
 * A class that represents the about page.
 */
class About extends RouterBase {
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

        route.path = "/about";

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
     * @returns {Promise} A promise that resolves when the request is processed.
     */
    static async get(req, res) {
        const user = await User.getCurrent(req);

        res.status(200).send(await Common.page(
            "",
            {css: ["/css/about.css"]},
            AboutView.get(),
            req,
            user
        ));
    }
}

module.exports = About;
