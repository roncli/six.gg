/**
 * @typedef {typeof import(".")} Discord
 * @typedef {import("discord.js").Activity} DiscordJs.Activity
 * @typedef {import("discord.js").GuildMember} DiscordJs.GuildMember
 * @typedef {typeof import("../twitch")} Twitch
 */

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

        /** @type {Map<string, {member: DiscordJs.GuildMember, activity: DiscordJs.Activity}>} */
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
        this.streamers.set(member.id, {member, activity});

        await member.roles.add([Discord.findRoleByName("Live"), Discord.findRoleByName("Streamers")]);

        if (!this.featured) {
            this.feature(member.id);
        }

        if (notify) {
            const user = await Twitch.botTwitchClient.helix.users.getUserByName(twitchName);
            if (!user) {
                return;
            }

            const channel = await Twitch.botTwitchClient.kraken.channels.getChannel(user.id);
            if (!channel) {
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
     * @returns {void}
     */
    feature(id) {
        this.featured = id;
        const index = this.previouslyFeatured.indexOf(id);
        if (index !== -1) {
            this.previouslyFeatured.splice(index, 1);
        }
        this.previouslyFeatured.push(id);
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
                this.feature(Array.from(this.streamers.keys()).map((s) => ({id: s, index: this.previouslyFeatured.indexOf(s)})).sort((a, b) => a.index - b.index)[0].id);
            }
        }
    }
}

module.exports = Streamers;
