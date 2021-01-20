/**
 * @typedef {import("../../types/browser/viewTypes").IndexViewParameters} ViewTypes.IndexViewParameters
 */

//   ###              #                #   #    #
//    #               #                #   #
//    #    # ##    ## #   ###   #   #  #   #   ##     ###   #   #
//    #    ##  #  #  ##  #   #   # #    # #     #    #   #  #   #
//    #    #   #  #   #  #####    #     # #     #    #####  # # #
//    #    #   #  #  ##  #       # #    # #     #    #      # # #
//   ###   #   #   ## #   ###   #   #    #     ###    ###    # #
/**
 * A class that represents the general website template.
 */
class IndexView {
    //              #
    //              #
    //  ###   ##   ###
    // #  #  # ##   #
    //  ##   ##     #
    // #      ##     ##
    //  ###
    /**
     * Gets the rendered page template.
     * @param {ViewTypes.IndexViewParameters} data The data to render the page with.
     * @returns {string} An HTML string of the page.
     */
    get(data) {
        const {head, html, protocol, host, originalUrl, year, version, user, guildMember} = data;

        return /* html */`
            <html>
                <head>
                    <title>Six Gaming</title>
                    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
                    <meta name="og:image" content="${protocol}://${host}/images/six.png" />
                    <meta name="og:title" content="Six Gaming" />
                    <meta name="og:type" content="website" />
                    <meta name="og:url" content="${protocol}://${host}${encodeURI(originalUrl)}" />
                    <meta name="twitter:card" content="summary" />
                    <meta name="twitter:creator" content="@roncli" />
                    ${head}
                </head>
                <body>
                    <div id="page">
                        <div id="menu">
                            <ul>
                                <li><a href="/">Home</a></li>
                                <li><a href="/calendar">Calendar</a></li>
                                <li><a href="/members">Members</a></li>
                                <li><a href="/about">About</a></li>
                                ${user ? /* html */`
                                    <li class="login">
                                        <a href="/logout">Log Out</a>
                                    </li>
                                    <li class="login">
                                        <a href="/me">
                                            <img src="${guildMember.user.displayAvatarURL({size: 32, format: "png"})}" />
                                            ${IndexView.encoding.htmlEncode(user.guildMember.nick || user.discord.username)}
                                        </a>
                                    </li>
                                    ` : /* html */`
                                    <li class="login">
                                        <a href="/login">Login with Discord</a>
                                    </li>
                                `}
                            </ul>
                        </div>
                        <div id="header">
                            <div id="logo"></div>
                        </div>
                        <div id="page-body">
                            ${html}
                            ${user ? "" : /* html */`
                                <div id="discord">
                                    <div class="section title font-pixel-huge">Join Six Gaming on Discord!</div>
                                    <div class="text">Interested in joining?  Six Gaming is for people who love playing games with others.  Join our Discord server and meet people from around the world.</div>
                                    <div class="link"><a href="/discord" target="_blank"><img src="/images/discord.png" /></a></div>
                                </div>
                            `}
                        </div>
                        <div id="copyright">
                            <div class="left">
                                Content &copy;${+year > 2015 ? "2015-" : ""}${year} Six Gaming<br />
                                Website Version ${version}, &copy;${+year > 2021 ? "2021-" : ""}${year} roncli Productions
                            </div>
                            <div class="right">
                                Bugs?  <a href="https://github.com/roncli/six.gg/issues" target="_blank">Report on GitHub</a>
                            </div>
                        </div>
                    </div>
                </body>
            </html>
        `;
    }
}

/** @type {import("../js/common/encoding")} */
// @ts-ignore
IndexView.encoding = new (typeof Encoding === "undefined" ? require("../js/common/encoding") : Encoding)(); // eslint-disable-line no-undef

if (typeof module !== "undefined") {
    module.exports = IndexView; // eslint-disable-line no-undef
}
