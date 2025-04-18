/**
 * @typedef {typeof import("./index")} Discord
 */

const DiscordJs = require("discord.js"),
    Log = require("@roncli/node-application-insights-logger");

// MARK: class VoiceChannelManagement
/**
 * A class that manages Discord voice channels.
 */
class VoiceChannelManagement {
    /** @type {Discord} */
    static #Discord;

    // MARK: constructor
    /**
     * Creates an instance of the voice channel management handler.
     * @param {Discord} discord The Discord object.
     */
    constructor(discord) {
        if (!VoiceChannelManagement.#Discord) {
            VoiceChannelManagement.#Discord = discord;
        }

        /** @type {{[x: string]: NodeJS.Timeout}} */
        this.channelDeletionTimeouts = {};

        /** @type {{[x: string]: string}} */
        this.lastCreatedChannel = {};

        /** @type {{[x: string]: NodeJS.Timeout}} */
        this.userCreatedChannels = {};
    }

    // MARK: canCreateChannel
    /**
     * Determine if the user can create a channel.
     * @param {DiscordJs.GuildMember} member The guild member trying to create a channel.
     * @returns {boolean} Whether the user can create a channel.
     */
    canCreateChannel(member) {
        return !this.userCreatedChannels[member.id];
    }

    // MARK: create
    /**
     * Creates a voice channel for a member.
     * @param {DiscordJs.GuildMember} member The guild member.
     * @param {string} title The title of the channel.
     * @returns {Promise} A promise that resolves when the channel has been created.
     */
    async create(member, title) {
        const vcm = this;

        const channel = /** @type {DiscordJs.VoiceChannel} */(await VoiceChannelManagement.#Discord.createChannel(title, DiscordJs.ChannelType.GuildVoice)); // eslint-disable-line @stylistic/no-extra-parens

        await channel.setParent(VoiceChannelManagement.#Discord.findCategoryByName("Voice"));

        vcm.userCreatedChannels[member.id] = setTimeout(() => {
            delete vcm.userCreatedChannels[member.id];
        }, 300000);

        vcm.lastCreatedChannel[member.id] = title;

        vcm.markEmptyVoiceChannel(channel, channel.members.size === 0);

        return channel;
    }

    // MARK: getCreatedChannel
    /**
     * Gets the member's most recent created channel.
     * @param {DiscordJs.GuildMember} member The guild member.
     * @returns {DiscordJs.VoiceChannel} The user's created voice channel.
     */
    getCreatedChannel(member) {
        const vcm = this;

        if (!vcm.lastCreatedChannel[member.id]) {
            return void 0;
        }

        return VoiceChannelManagement.#Discord.findVoiceChannelByName(vcm.lastCreatedChannel[member.id]) || void 0;
    }

    // MARK: markEmptyVoiceChannel
    /**
     * Marks a voice channel as either empty or not, queuing it for deleting in 5 minutes.
     * @param {DiscordJs.VoiceChannel | DiscordJs.StageChannel} channel The voice channel.
     * @param {boolean} isEmpty Whether the voice channel is empty or not.
     * @returns {void}
     */
    markEmptyVoiceChannel(channel, isEmpty) {
        const vcm = this;

        if (isEmpty) {
            vcm.channelDeletionTimeouts[channel.id] = setTimeout(async () => {
                if (channel) {
                    try {
                        await channel.delete();
                    } catch (err) {
                        Log.error(`Couldn't delete empty voice channel ${channel}.`, {err});
                    } finally {
                        delete vcm.channelDeletionTimeouts[channel.id];
                    }
                }
            }, 300000);
        } else {
            clearTimeout(vcm.channelDeletionTimeouts[channel.id]);
            delete vcm.channelDeletionTimeouts[channel.id];
        }
    }
}

module.exports = VoiceChannelManagement;
