/**
 * @typedef {import("discord.js").Activity} DiscordJs.Activity
 * @typedef {import("discord.js").GuildMember} DiscordJs.GuildMember
 */

// MARK: class LiveView
/**
 * Class that represenets the live view for the home page.
 */
class LiveView {
    // MARK: static get
    /**
     * Gets the rendered page template.
     * @param {{member: DiscordJs.GuildMember, activity: DiscordJs.Activity}[]} data The page data.
     * @returns {string} An HTML string of the page.
     */
    static get(data) {
        return /* html */`
            ${data.map((stream) => /* html */`
                <div><a href="${stream.activity.url}" target="_blank"><img src="/images/twitch.png"></a></div>
                <div><a href="${stream.activity.url}" target="_blank">${stream.member.displayName}</a></div>
            `)}
        `;
    }
}

if (typeof module === "undefined") {
    window.LiveView = LiveView;
} else {
    module.exports = LiveView;
}
