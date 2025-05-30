/**
 * @typedef {typeof import(".")} Discord
 * @typedef {import("discord.js").Activity} DiscordJs.Activity
 * @typedef {import("discord.js").GuildMember} DiscordJs.GuildMember
 * @typedef {typeof import("../twitch")} Twitch
 */

// MARK: class Streamers
/**
 * A class that handles streamers listed in Discord.
 */
class Streamers {
    /** @type {Discord} */
    static #Discord;

    /** @type {{[x: string]: number}} */
    static #lastAnnounced = {};

    /** @type {Twitch} */
    static #Twitch;

    // MARK: constructor
    /**
     * Creates an instance of the streamers handler.
     * @param {Discord} discord The Discord object.
     * @param {Twitch} twitch The Twitch object.
     */
    constructor(discord, twitch) {
        if (!Streamers.#Discord) {
            Streamers.#Discord = discord;
        }

        if (!Streamers.#Twitch) {
            Streamers.#Twitch = twitch;
        }

        /** @type {Map<string, {member: DiscordJs.GuildMember, activity: DiscordJs.Activity, twitchName: string}>} */
        this.streamers = new Map();

        /** @type {Array<string>} */
        this.previouslyFeatured = [];

        /** @type {string} */
        this.featured = void 0;

        /** @type {string} */
        this.featuredChannel = void 0;
    }

    // MARK: async add
    /**
     * Adds a user to the streamers list.
     * @param {DiscordJs.GuildMember} member The Discord member.
     * @param {DiscordJs.Activity} activity The activity.
     * @param {string} twitchName The Twitch username.
     * @param {boolean} [notify] Whether to notify Discord that the streamer has gone live.
     * @returns {Promise<void>}
     */
    async add(member, activity, twitchName, notify) {
        this.streamers.set(member.id, {member, activity, twitchName});

        await member.roles.add([Streamers.#Discord.findRoleByName("Live"), Streamers.#Discord.findRoleByName("Streamers")]);

        if (!Streamers.#lastAnnounced[member.id]) {
            Streamers.#lastAnnounced[member.id] = 0;
        }

        if (new Date().getTime() - Streamers.#lastAnnounced[member.id] < 300000) {
            Streamers.#lastAnnounced[member.id] = new Date().getTime();
            return;
        }

        Streamers.#lastAnnounced[member.id] = new Date().getTime();

        if (notify) {
            const user = await Streamers.#Twitch.botTwitchClient.users.getUserByName(twitchName),
                channel = await Streamers.#Twitch.botTwitchClient.channels.getChannelInfoById(user.id);

            await Streamers.#Discord.richQueue(Streamers.#Discord.embedBuilder({
                timestamp: new Date(),
                thumbnail: {
                    url: user.profilePictureUrl,
                    width: 300,
                    height: 300
                },
                url: `https://twitch.tv/${user.name}`,
                description: `${member} just went live on Twitch!  Watch at https://twitch.tv/${user.name}`,
                fields: [
                    {
                        name: "Stream Title",
                        value: channel.title
                    },
                    {
                        name: "Now Playing",
                        value: activity.state
                    }
                ]
            }), Streamers.#Discord.findTextChannelByName("live-stream-announcements"));
        }

        if (!this.featured) {
            this.feature(member.id, twitchName);
        }
    }

    // MARK: feature
    /**
     * Features the streamer by their Discord ID.
     * @param {string} id The Discord ID.
     * @param {string} channel The Twitch channel.
     * @returns {void}
     */
    feature(id, channel) {
        this.featured = id;
        this.featuredChannel = channel;
        const index = this.previouslyFeatured.indexOf(id);
        if (index !== -1) {
            this.previouslyFeatured.splice(index, 1);
        }
        this.previouslyFeatured.push(id);
    }

    // MARK: async remove
    /**
     * Removes a user from the streamers list.
     * @param {DiscordJs.GuildMember} member The Discord member.
     * @returns {Promise<void>}
     */
    async remove(member) {
        this.streamers.delete(member.id);

        await member.roles.remove(Streamers.#Discord.findRoleByName("Live"));

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

                this.feature(data.id, data.twitchName);
            }
        }
    }
}

module.exports = Streamers;
