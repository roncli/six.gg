/**
 * @typedef {import("discord.js").Activity} DiscordJs.Activity
 * @typedef {import("discord.js").GuildMember} DiscordJs.GuildMember
 */

// MARK: class StreamersView
/**
 * Class that represenets the streamers view for the home page.
 */
class StreamersView {
    // MARK: static get
    /**
     * Gets the rendered page template.
     * @param {{member: DiscordJs.GuildMember, activity: DiscordJs.Activity}[]} data The page data.
     * @returns {string} An HTML string of the page.
     */
    static get(data) {
        return /* html */`
            <div class="section">Featured Streamer</div>
            <div id="featured">
                <div><a href="${data[0].activity.url}" target="_blank"><img src="/images/twitch.png"></a></div>
                <div><a href="${data[0].activity.url}" target="_blank" id="name">${data[0].member.displayName}</a></div>
            </div>
            <div id="twitch">
            </div>
            <div id="live">
                ${data.length === 1 ? "" : StreamersView.LiveView.get(data.slice(1))}
            </div>
        `;
    }
}

/** @type {typeof import("./live")} */
// @ts-ignore
StreamersView.LiveView = typeof LiveView === "undefined" ? require("./live") : LiveView; // eslint-disable-line no-undef

if (typeof module === "undefined") {
    window.StreamersView = StreamersView;
} else {
    module.exports = StreamersView; // eslint-disable-line no-undef
}
