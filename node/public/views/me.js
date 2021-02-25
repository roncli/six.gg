/**
 * @typedef {import("../../src/models/user")} User
 * @typedef {import("../../types/browser/viewTypes").MeViewParameters} ViewTypes.MeViewParameters
 */

//  #   #         #   #    #
//  #   #         #   #
//  ## ##   ###   #   #   ##     ###   #   #
//  # # #  #   #   # #     #    #   #  #   #
//  #   #  #####   # #     #    #####  # # #
//  #   #  #       # #     #    #      # # #
//  #   #   ###     #     ###    ###    # #
/**
 * A class that represents the me view.
 */
class MeView {
    //              #
    //              #
    //  ###   ##   ###
    // #  #  # ##   #
    //  ##   ##     #
    // #      ##     ##
    //  ###
    /**
     * Gets the rendered page template.
     * @param {ViewTypes.MeViewParameters} data The data to render the page with.
     * @returns {string} An HTML string of the page.
     */
    static get(data) {
        const {user, guildMember, timezones} = data;
        return /* html */`
            <div class="section">
                <img src="${guildMember.user.displayAvatarURL({size: 64, format: "png"})}" />
                ${MeView.Encoding.htmlEncode(user.guildMember.nick || user.discord.username)}
            </div>
            <div class="section">Connections</div>
            <div id="connections">
                <div>Connect to Steam, Twitch, Twitter, and YouTube within Discord, and those connections will update here when you log out and log back in.<br /><br /></div>
                ${user.connections && user.connections.length > 0 ? /* html */`
                    ${user.connections.filter((c) => ["steam", "twitch", "twitter", "youtube"].indexOf(c.type) !== -1).sort((a, b) => a.type.localeCompare(b.type)).map((connection) => /* html */`
                        <div>
                            <a href="${MeView.Connection.getUrl(connection)}" target="_blank"><img src="/images/${connection.type}.png" alt="${connection.type}" /></a>
                            &nbsp;
                            <a href="${MeView.Connection.getUrl(connection)}" target="_blank">${connection.type.charAt(0).toUpperCase()}${connection.type.substring(1)}</a>
                            - ${connection.name}
                        </div>
                    `).join("")}
                ` : ""}
            </div>
            <div class="section">Profile</div>
            <div id="profile">
                <div class="header">Location:</div>
                <div><input id="location" type="text" placeholder="Houston, Texas" value="${MeView.Encoding.attributeEncode(user.location)}" maxlength="50" /><span></span></div>
                <div class="header">Timezone:</div>
                <div>
                    <select id="timezone">
                        ${MeView.Options.generateOptions(timezones.map((zone) => ({text: `${zone.zone} (${zone.time})`, value: zone.zone})), user.timezone, false)}
                    </select><span></span>
                </div>
            </div>
        `;
    }
}

/** @type {typeof import("../js/common/connection")} */
// @ts-ignore
MeView.Connection = typeof Connection === "undefined" ? require("../js/common/connection") : Connection; // eslint-disable-line no-undef

/** @type {typeof import("../js/common/encoding")} */
// @ts-ignore
MeView.Encoding = typeof Encoding === "undefined" ? require("../js/common/encoding") : Encoding; // eslint-disable-line no-undef

/** @type {typeof import("../js/common/options")} */
// @ts-ignore
MeView.Options = typeof options === "undefined" ? require("../js/common/options") : Options; // eslint-disable-line no-undef

if (typeof module !== "undefined") {
    module.exports = MeView; // eslint-disable-line no-undef
}
