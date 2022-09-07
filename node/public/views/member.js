/**
 * @typedef {import("../../src/models/user")} User
 * @typedef {import("../../types/browser/viewTypes").MemberViewParameters} ViewTypes.MemberViewParameters
 */

//  #   #                #                    #   #    #
//  #   #                #                    #   #
//  ## ##   ###   ## #   # ##    ###   # ##   #   #   ##     ###   #   #
//  # # #  #   #  # # #  ##  #  #   #  ##  #   # #     #    #   #  #   #
//  #   #  #####  # # #  #   #  #####  #       # #     #    #####  # # #
//  #   #  #      # # #  ##  #  #      #       # #     #    #      # # #
//  #   #   ###   #   #  # ##    ###   #        #     ###    ###    # #
/**
 * A class that represents the me view.
 */
class MemberView {
    //              #
    //              #
    //  ###   ##   ###
    // #  #  # ##   #
    //  ##   ##     #
    // #      ##     ##
    //  ###
    /**
     * Gets the rendered page template.
     * @param {ViewTypes.MemberViewParameters} data The data to render the page with.
     * @returns {string} An HTML string of the page.
     */
    static get(data) {
        const {user, guildMember} = data;
        return /* html */`
            <div class="section">
                <img src="${guildMember.user.displayAvatarURL({size: 64, extension: "png"})}" />
                ${MemberView.Encoding.htmlEncode(user.guildMember.nick || user.discord.username)}
            </div>
            <div class="section">Connections</div>
            <div id="connections">
                ${user.connections && user.connections.length > 0 ? /* html */`
                    ${user.connections.filter((c) => ["steam", "twitch", "twitter", "youtube"].indexOf(c.type) !== -1).sort((a, b) => a.type.localeCompare(b.type)).map((connection) => /* html */`
                        <div>
                            <a href="${MemberView.Connection.getUrl(connection)}" target="_blank"><img src="/images/${connection.type}.png" alt="${connection.type}" /></a>
                            &nbsp;
                            <a href="${MemberView.Connection.getUrl(connection)}" target="_blank">${connection.type.charAt(0).toUpperCase()}${connection.type.substring(1)}</a>
                            - ${connection.name}
                        </div>
                    `).join("")}
                ` : ""}
            </div>
            <div class="section">Profile</div>
            <div id="profile">
                <div class="header">Location:</div>
                <div>${MemberView.Encoding.htmlEncode(user.location)}</div>
            </div>
        `;
    }
}

/** @type {typeof import("../js/common/connection")} */
// @ts-ignore
MemberView.Connection = typeof Connection === "undefined" ? require("../js/common/connection") : Connection; // eslint-disable-line no-undef

/** @type {typeof import("../js/common/encoding")} */
// @ts-ignore
MemberView.Encoding = typeof Encoding === "undefined" ? require("../js/common/encoding") : Encoding; // eslint-disable-line no-undef

if (typeof module === "undefined") {
    window.MemberView = MemberView;
} else {
    module.exports = MemberView; // eslint-disable-line no-undef
}
