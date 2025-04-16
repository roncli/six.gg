/**
 * @typedef {import("discord.js").Activity} DiscordJs.Activity
 * @typedef {import("discord.js").GuildMember} DiscordJs.GuildMember
 */

// MARK: class Home
/**
 * A class that provides functions for the home page.
 */
class Home {
    // MARK: static DOMContentLoaded
    /**
     * Sets up the page.
     * @returns {void}
     */
    static DOMContentLoaded() {
        Home.streamsInterval = window.setInterval(Home.reloadStreams, 300000);

        Home.embedTwitch();

        const el = document.getElementById("calendar"),
            calendar = new window.FullCalendar.Calendar(el, {
                timeZone: window.timezone,
                height: "auto",
                initialView: "list7Days",
                views: {
                    list7Days: {
                        type: "list",
                        duration: {days: 7},
                        titleFormat: {
                            day: "numeric",
                            month: "long",
                            year: "numeric"
                        }
                    }
                },
                headerToolbar: {
                    left: "title",
                    center: "",
                    right: ""
                },
                events: "/api/events"
            });

        calendar.render();
    }

    // MARK: static embedTwitch
    /**
     * Embeds Twitch into the site.
     * @returns {void}
     */
    static embedTwitch() {
        const el = document.getElementById("name");

        let url;
        if (el && el.innerText) {
            url = el.getAttribute("href");
        }

        if (!url) {
            return;
        }

        const urlParse = /^https:\/\/www.twitch.tv\/(?<user>.+)$/;
        if (!urlParse.test(url)) {
            return;
        }

        const {groups: {user}} = urlParse.exec(url);

        Home.embed = null;

        document.getElementById("twitch").innerHTML = "";

        Home.embed = new window.Twitch.Embed("twitch", {
            width: 1160,
            height: 460,
            channel: user,
            allowfullscreen: true,
            autoplay: true,
            layout: "video-with-chat",
            theme: "light"
        });

        Home.embed.addEventListener(window.Twitch.Embed.VIDEO_READY, () => {
            const player = Home.embed.getPlayer();
            player.addEventListener(window.Twitch.Player.ENDED, async () => {
                clearInterval(Home.streamsInterval);
                await Home.reloadStreams();
                Home.streamsInterval = window.setInterval(Home.reloadStreams, 300000);
            });
        });
    }

    // MARK: static async reloadStreams
    /**
     * Reloads the streams from the API.
     * @returns {Promise} A promise that resolves when the streams have been reloaded.
     */
    static async reloadStreams() {
        /** @type {{member: DiscordJs.GuildMember, activity: DiscordJs.Activity}[]} */
        let data;
        try {
            data = await (await fetch("/api/live")).json();
        } catch (err) {
            return;
        }

        const streamers = document.getElementById("streamers");

        if (data.length === 0) {
            streamers.innerHTML = "";
            return;
        }

        const el = document.getElementById("name");

        let featured;
        if (el && el.innerText) {
            featured = el.innerText;
        }

        try {
            await Home.Template.loadTemplate("/views/home/live.js", "LiveView");
        } catch (err) {
            return;
        }

        if (data[0].member.displayName === featured) {
            const live = document.getElementById("live");
            Home.Template.loadDataIntoTemplate(data.slice(1), live, window.LiveView.get);
        } else {
            try {
                await Home.Template.loadTemplate("/views/home/streamers.js", "StreamersView");
            } catch (err) {
                return;
            }

            Home.Template.loadDataIntoTemplate(data, streamers, window.StreamersView.get);
        }
    }
}

Home.embed = null;

/** @type {number} */
Home.streamsInterval = null;

/** @type {typeof import("./common/template")} */
// @ts-ignore
Home.Template = typeof Template === "undefined" ? require("./common/template") : Template; // eslint-disable-line no-undef

document.addEventListener("DOMContentLoaded", Home.DOMContentLoaded);

if (typeof module === "undefined") {
    window.Home = Home;
} else {
    module.exports = Home; // eslint-disable-line no-undef
}
