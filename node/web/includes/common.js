/**
 * @typedef {import("../../types/node/commonTypes").Files} CommonTypes.Files
 * @typedef {import("express").Request} Express.Request
 * @typedef {import("../../src/models/user")} User
 */

const Discord = require("../../src/discord"),
    HtmlMinifier = require("html-minifier"),
    IndexView = require("../../public/views/index"),
    Minify = require("../../src/minify"),
    pjson = require("../../package.json");

//   ###
//  #   #
//  #       ###   ## #   ## #    ###   # ##
//  #      #   #  # # #  # # #  #   #  ##  #
//  #      #   #  # # #  # # #  #   #  #   #
//  #   #  #   #  # # #  # # #  #   #  #   #
//   ###    ###   #   #  #   #   ###   #   #
/**
 * A class that handles common web functions.
 */
class Common {
    // ###    ###   ###   ##
    // #  #  #  #  #  #  # ##
    // #  #  # ##   ##   ##
    // ###    # #  #      ##
    // #            ###
    /**
     * Generates a webpage from the provided HTML using a common template.
     * @param {string} head The HTML to insert into the header.
     * @param {CommonTypes.Files} files The files to combine and minify.
     * @param {string} html The HTML to make a full web page from.
     * @param {Express.Request} req The request of the page.
     * @param {User} user The user.
     * @returns {string} The HTML of the full web page.
     */
    static page(head, files, html, req, user) {
        if (!files) {
            files = {js: [], css: []};
        }

        if (!files.js) {
            files.js = [];
        }

        if (!files.css) {
            files.css = [];
        }

        files.js.unshift("/js/common/encoding.js");
        files.css.unshift("/css/common.css");
        files.css.unshift("/css/reset.css");

        const minify = new Minify();

        head = `${head}${minify.combine(files.js, "js")}${minify.combine(files.css, "css")}${Common.favIcon()}`;

        let guildMember;
        if (user) {
            guildMember = Discord.findGuildMemberById(user.discord.id);
        }

        return HtmlMinifier.minify(
            new IndexView().get({
                head,
                html,
                protocol: req.protocol,
                host: req.get("host"),
                originalUrl: req.originalUrl,
                year: new Date().getFullYear(),
                version: pjson.version,
                user,
                guildMember
            }),
            {
                collapseBooleanAttributes: true,
                collapseWhitespace: true,
                decodeEntities: true,
                html5: true,
                removeAttributeQuotes: true,
                removeComments: true,
                removeEmptyAttributes: true,
                removeOptionalTags: true,
                removeRedundantAttributes: true,
                useShortDoctype: true
            }
        );
    }

    //   #               ###
    //  # #               #
    //  #     ###  # #    #     ##    ##   ###
    // ###   #  #  # #    #    #     #  #  #  #
    //  #    # ##  # #    #    #     #  #  #  #
    //  #     # #   #    ###    ##    ##   #  #
    /**
     * Returns the HTML to generate the favicon.
     * @returns {string} The HTML to generate the favicon.
     */
    static favIcon() {
        return /* html */`
            <meta name="apple-mobile-web-app-title" content="Six Gaming">
            <meta name="application-name" content="Six Gaming">
            <meta name="msapplication-TileColor" content="#0b8b8c">
            <meta name="msapplication-config" content="/images/browserconfig.xml">
            <meta name="theme-color" content="#ffffff">
            <link rel="apple-touch-icon" sizes="180x180" href="/images/apple-touch-icon.png">
            <link rel="icon" type="image/png" sizes="32x32" href="/images/favicon-32x32.png">
            <link rel="icon" type="image/png" sizes="16x16" href="/images/favicon-16x16.png">
            <link rel="manifest" href="/images/site.webmanifest">
            <link rel="mask-icon" href="/images/safari-pinned-tab.svg" color="#0b8b8c">
            <link rel="shortcut icon" href="/images/favicon.ico">
        `;
    }

    //   #                            #    ###    #
    //  # #                           #     #
    //  #     ##   ###   # #    ###  ###    #    ##    # #    ##
    // ###   #  #  #  #  ####  #  #   #     #     #    ####  # ##
    //  #    #  #  #     #  #  # ##   #     #     #    #  #  ##
    //  #     ##   #     #  #   # #    ##   #    ###   #  #   ##
    /**
     * Formats the time portion of the date.
     * @param {Date} time The time to display.
     * @returns {string} The formatted time.
     */
    static formatTime(time) {
        return `${time.getHours() === 0 ? 12 : time.getHours() > 12 ? time.getHours() - 12 : time.getHours()}:${time.getMinutes() < 10 ? "0" : ""}${time.getMinutes()} ${time.getHours() < 12 ? "AM" : "PM"}`;
    }

    //   #                            #    ###          #
    //  # #                           #    #  #         #
    //  #     ##   ###   # #    ###  ###   #  #   ###  ###    ##
    // ###   #  #  #  #  ####  #  #   #    #  #  #  #   #    # ##
    //  #    #  #  #     #  #  # ##   #    #  #  # ##   #    ##
    //  #     ##   #     #  #   # #    ##  ###    # #    ##   ##
    /**
     * Formats the date to show in the user's time zone.
     * @param {Date} time The date and time to display.
     * @returns {string} The formatted date and time.
     */
    static formatDate(time) {
        const now = new Date(),
            today = new Date(now);

        today.setMilliseconds(0);
        today.setSeconds(0);
        today.setMinutes(0);
        today.setHours(0);

        const date = new Date(time);

        date.setMilliseconds(0);
        date.setSeconds(0);
        date.setMinutes(0);
        date.setHours(0);

        switch (date.getTime() - today.getTime()) {
            case 0:
                return `Today ${Common.formatTime(time)}`;
            case 86400000:
                return `Tomorrow ${Common.formatTime(time)}`;
            case -86400000:
                return `Yesterday ${Common.formatTime(time)}`;
            default:
                return `${["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][time.getMonth()]} ${time.getDate()} ${time.getFullYear()} ${Common.formatTime(time)}`;
        }
    }

    //   #                            #    ###    #
    //  # #                           #     #
    //  #     ##   ###   # #    ###  ###    #    ##    # #    ##    ###   ###    ###  ###
    // ###   #  #  #  #  ####  #  #   #     #     #    ####  # ##  ##     #  #  #  #  #  #
    //  #    #  #  #     #  #  # ##   #     #     #    #  #  ##      ##   #  #  # ##  #  #
    //  #     ##   #     #  #   # #    ##   #    ###   #  #   ##   ###    ###    # #  #  #
    //                                                                    #
    /**
     * Formats a timespan.
     * @param {number} time The number of seconds.
     * @returns {string} A string representing the timespan.
     */
    static formatTimespan(time) {
        if (!time) {
            return "";
        }

        time = Math.round(time);
        return `${Math.floor(time / 3600)}:${(Math.floor(time / 60) % 60).toLocaleString("en-US", {minimumIntegerDigits: 2})}:${(time % 60).toLocaleString("en-US", {minimumIntegerDigits: 2})}`;
    }
}

Common.route = {
    include: true
};

module.exports = Common;
