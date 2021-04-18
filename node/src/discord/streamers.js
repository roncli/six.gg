/**
 * @typedef {typeof import(".")} Discord
 * @typedef {import("discord.js").Activity} DiscordJs.Activity
 * @typedef {import("discord.js").GuildMember} DiscordJs.GuildMember
 * @typedef {typeof import("../twitch")} Twitch
 */

const Log = require("node-application-insights-logger");

/** @type {{[x: string]: number}} */
const lastAnnounced = {};

/** @type {Discord} */
let Discord;

/** @type {Twitch} */
let Twitch;

//   ###    #
//  #   #   #
//  #      ####   # ##    ###    ###   ## #    ###   # ##    ###
//   ###    #     ##  #  #   #      #  # # #  #   #  ##  #  #
//      #   #     #      #####   ####  # # #  #####  #       ###
//  #   #   #  #  #      #      #   #  # # #  #      #          #
//   ###     ##   #       ###    ####  #   #   ###   #      ####
/**
 * A class that handles streamers listed in Discord.
 */
class Streamers {
    //                           #                       #
    //                           #                       #
    //  ##    ##   ###    ###   ###   ###   #  #   ##   ###    ##   ###
    // #     #  #  #  #  ##      #    #  #  #  #  #      #    #  #  #  #
    // #     #  #  #  #    ##    #    #     #  #  #      #    #  #  #
    //  ##    ##   #  #  ###      ##  #      ###   ##     ##   ##   #
    /**
     * Creates an instance of the streamers handler.
     * @param {Discord} discord The Discord object.
     * @param {Twitch} twitch The Twitch object.
     */
    constructor(discord, twitch) {
        if (!Discord) {
            Discord = discord;
        }

        if (!Twitch) {
            Twitch = twitch;
        }

        /** @type {Map<string, {member: DiscordJs.GuildMember, activity: DiscordJs.Activity, twitchName: string}>} */
        this.streamers = new Map();

        /** @type {Array<string>} */
        this.previouslyFeatured = [];

        /** @type {string} */
        this.featured = void 0;
    }

    //          #     #
    //          #     #
    //  ###   ###   ###
    // #  #  #  #  #  #
    // # ##  #  #  #  #
    //  # #   ###   ###
    /**
     * Adds a user to the streamers list.
     * @param {DiscordJs.GuildMember} member The Discord member.
     * @param {DiscordJs.Activity} activity The activity.
     * @param {string} twitchName The Twitch username.
     * @param {boolean} [notify] Whether to notify Discord that the streamer has gone live.
     * @returns {Promise} A promise that resolves when the streamer has been added.
     */
    async add(member, activity, twitchName, notify) {
        this.streamers.set(member.id, {member, activity, twitchName});

        await member.roles.add([Discord.findRoleByName("Live"), Discord.findRoleByName("Streamers")]);

        if (!lastAnnounced[member.id]) {
            lastAnnounced[member.id] = 0;
        }

        if (new Date().getTime() - lastAnnounced[member.id] < 300000) {
            lastAnnounced[member.id] = new Date().getTime();
            if (notify) {
                Log.info("Did not notify because last announced less than 5 minutes ago.", {properties: {twitchName}});
            }
            return;
        }

        lastAnnounced[member.id] = new Date().getTime();

        if (!this.featured) {
            await this.feature(member.id, twitchName);
        }

        if (notify) {
            const user = await Twitch.botTwitchClient.helix.users.getUserByName(twitchName);
            if (!user) {
                Log.info("Did not notify because user was not found.", {properties: {twitchName}});
                return;
            }

            const channel = await Twitch.botTwitchClient.kraken.channels.getChannel(user.id);
            if (!channel) {
                Log.info("Did not notify because channel was not found.", {properties: {twitchName, userId: user.id}});
                return;
            }

            await Discord.richQueue(Discord.messageEmbed({
                timestamp: new Date(),
                thumbnail: {
                    url: channel.logo,
                    width: 300,
                    height: 300
                },
                image: {
                    url: channel.profileBanner,
                    width: 1920,
                    height: 480
                },
                url: channel.url,
                description: `${member} just went live on Twitch!  Watch at ${channel.url}`,
                fields: [
                    {
                        name: "Stream Title",
                        value: channel.status
                    },
                    {
                        name: "Now Playing",
                        value: activity.state
                    }
                ]
            }), Discord.findTextChannelByName("live-stream-announcements"));
        }
    }

    //   #                #
    //  # #               #
    //  #     ##    ###  ###   #  #  ###    ##
    // ###   # ##  #  #   #    #  #  #  #  # ##
    //  #    ##    # ##   #    #  #  #     ##
    //  #     ##    # #    ##   ###  #      ##
    /**
     * Features the streamer by their Discord ID.
     * @param {string} id The Discord ID.
     * @param {string} channel The Twitch channel.
     * @returns {Promise} A promise that resolves when the streamer has been featured.
     */
    async feature(id, channel) {
        this.featured = id;
        const index = this.previouslyFeatured.indexOf(id);
        if (index !== -1) {
            this.previouslyFeatured.splice(index, 1);
        }
        this.previouslyFeatured.push(id);

        try {
            await Twitch.botChatClient.host("sixgaminggg", channel);
        } catch (err) {
            Log.error("There was an error while hosting a featured streamer.", {err});
        }
    }

    // ###    ##   # #    ##   # #    ##
    // #  #  # ##  ####  #  #  # #   # ##
    // #     ##    #  #  #  #  # #   ##
    // #      ##   #  #   ##    #     ##
    /**
     * Removes a user from the streamers list.
     * @param {DiscordJs.GuildMember} member The Discord member.
     * @returns {Promise} A promise that resolves when the streamer has been removed.
     */
    async remove(member) {
        this.streamers.delete(member.id);

        await member.roles.remove(Discord.findRoleByName("Live"));

        if (member.id === this.featured) {
            {
                const index = this.previouslyFeatured.indexOf(member.id);
                if (index !== -1) {
                    this.previouslyFeatured.splice(index, 1);
                }
            }

            if (this.streamers.size === 0) {
                this.featured = void 0;
            } else {
                const data = Array.from(this.streamers.keys()).map((s) => ({id: s, twitchName: this.streamers.get(s).twitchName, index: this.previouslyFeatured.indexOf(s)})).sort((a, b) => a.index - b.index)[0];

                await this.feature(data.id, data.twitchName);
            }
        }
    }
}

module.exports = Streamers;
