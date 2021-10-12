/**
 * @typedef {import("../../types/node/commonTypes").Files} CommonTypes.Files
 * @typedef {import("express").Request} Express.Request
 * @typedef {import("../../src/models/user")} User
 */

const Discord = require("../../src/discord"),
    HtmlMinifierTerser = require("html-minifier-terser"),
    IndexView = require("../../public/views/index"),
    Minify = require("@roncli/node-minify"),
    pjson = require("../../package.json"),
    RouterBase = require("hot-router").RouterBase;

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
class Common extends RouterBase {
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

        route.include = true;

        return route;
    }

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
     * @returns {Promise<string>} The HTML of the full web page.
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

        head = /* html */`
            ${head}
            ${Minify.combine(files.js, "js")}
            ${Minify.combine(files.css, "css")}
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

        let guildMember;
        if (user) {
            guildMember = Discord.findGuildMemberById(user.discord.id);
        }

        return HtmlMinifierTerser.minify(
            IndexView.get({
                head,
                html,
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
                conservativeCollapse: true,
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
}

module.exports = Common;
