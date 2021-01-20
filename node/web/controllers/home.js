/**
 * @typedef {import("express").Request} Express.Request
 * @typedef {import("express").Response} Express.Response
 */

const Common = require("../includes/common"),
    DiscordListener = require("../../src/listeners/discord"),
    HomeView = require("../../public/views/home"),
    User = require("../../src/models/user");

//   #   #
//   #   #
//   #   #   ###   ## #    ###
//   #####  #   #  # # #  #   #
//   #   #  #   #  # # #  #####
//   #   #  #   #  # # #  #
//   #   #   ###   #   #   ###
/**
 * A class that represents the home page.
 */
class Home {
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
            streamers = Array.from(DiscordListener.streamers.streamers.values()),
            featured = DiscordListener.streamers.streamers.get(DiscordListener.streamers.featured);

        if (featured) {
            streamers.splice(streamers.indexOf(featured), 1);
            streamers.unshift(featured);
        }

        res.status(200).send(Common.page(
            "<script src=\"https://embed.twitch.tv/embed/v1.js\"></script>",
            {css: ["/css/fullcalendar/common.css", "/css/fullcalendar/list.css", "/css/fullcalendar.css", "/css/home.css"], js: ["/js/fullcalendar/core.js", "/js/fullcalendar/list.js", "/js/common/template.js", "/js/home.js"]},
            new HomeView().get({streamers, timezone: user && user.timezone ? user.timezone : process.env.DEFAULT_TIMEZONE, defaultTimezone: !(user && user.timezone)}),
            req,
            user
        ));
    }
}

Home.route = {
    path: "/"
};

module.exports = Home;
