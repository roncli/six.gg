const Discord = require("../discord"),
    DiscordJs = require("discord.js"),
    Exception = require("../errors/exception"),
    Log = require("@roncli/node-application-insights-logger"),
    Streamers = require("../discord/streamers"),
    Twitch = require("../twitch"),
    VoiceChannelManagement = require("../discord/voiceChannelManagement"),
    Warning = require("../errors/warning");

// MARK: class DiscordListener
/**
 * A class that handles listening to Discord events.
 */
class DiscordListener {
    /** @type {Streamers} */
    static #streamers;

    static #urlParse = /^https:\/\/www.twitch.tv\/(?<user>.+)$/;

    /** @type {VoiceChannelManagement} */
    static #vcm;

    // MARK: static get streamers
    /**
     * Returns the streamers object.
     * @returns {Streamers} The streamers object.
     */
    static get streamers() {
        return DiscordListener.#streamers;
    }

    // MARK: static get voiceChannelManagement
    /**
     * Returns the voice channel management object.
     * @returns {VoiceChannelManagement} The voice channel management object.
     */
    static get voiceChannelManagement() {
        return DiscordListener.#vcm;
    }

    // MARK: static async interactionCreate
    /**
     * Handles when an interaction is created in Discord.
     * @param {DiscordJs.Interaction<DiscordJs.CacheType>} interaction The interaction.
     * @returns {Promise<void>}
     */
    static async interactionCreate(interaction) {
        if (!interaction.isChatInputCommand()) {
            return;
        }

        let success = false;

        try {
            if (interaction.commandName === "simulate") {
                const module = require(`../discord/commands/${interaction.options.getSubcommand(true).toLowerCase()}`);

                success = await module.handle(interaction, interaction.options.getUser("from", true));
            } else {
                const module = require(`../discord/commands/${interaction.commandName.toLowerCase()}`);

                success = await module.handle(interaction, interaction.user);
            }
        } catch (err) {
            if (err instanceof Warning) {
                Log.warn(`${interaction.channel} ${interaction.user}: ${interaction} - ${err.message || err}`);
            } else if (err instanceof Exception) {
                Log.error(`${interaction.channel} ${interaction.user}: ${interaction} - ${err.message}`, {err: err.innerError});
            } else {
                Log.error(`${interaction.channel} ${interaction.user}: ${interaction}`, {err});
            }
        }

        if (success) {
            Log.verbose(`${interaction.channel} ${interaction.user}: ${interaction}`);
        }
    }

    // MARK: static async presenceUpdate
    /**
     * Handles when a user's Discord presence is updated.
     * @param {DiscordJs.Presence} oldPresence The old presence state.
     * @param {DiscordJs.Presence} newPresence The new presence state.
     * @returns {Promise<void>}
     */
    static async presenceUpdate(oldPresence, newPresence) {
        if (!DiscordListener.#streamers) {
            return;
        }

        if (newPresence && newPresence.activities && newPresence.member && newPresence.guild && newPresence.guild.id === Discord.id) {
            const oldActivity = oldPresence && oldPresence.activities && oldPresence.activities.find((p) => p.name === "Twitch") || void 0,
                activity = newPresence.activities.find((p) => p.name === "Twitch");

            if (activity && DiscordListener.#urlParse.test(activity.url)) {
                if (!oldActivity) {
                    const {groups: {user: twitchName}} = DiscordListener.#urlParse.exec(activity.url);
                    try {
                        await DiscordListener.#streamers.add(newPresence.member, activity, twitchName, true);
                    } catch (err) {
                        Log.error("There was an error adding a streamer.", {err});
                    }
                }
            } else {
                try {
                    await DiscordListener.#streamers.remove(newPresence.member);
                } catch (err) {
                    Log.error("There was an error removing a streamer.", {err});
                }
            }
        }
    }

    // MARK: static async ready
    /**
     * Handles when Discord is ready.
     * @returns {Promise<void>}
     */
    static async ready() {
        DiscordListener.#vcm = new VoiceChannelManagement(Discord);
        DiscordListener.#streamers = new Streamers(Discord, Twitch);

        Discord.channels.filter((channel) => channel.type === DiscordJs.ChannelType.GuildVoice).forEach((/** @type {DiscordJs.VoiceChannel} */ channel) => {
            if (channel.name !== "\u{1F4AC} General" && channel.members.size === 0) {
                DiscordListener.#vcm.markEmptyVoiceChannel(channel, true);
            }
        });

        for (const member of Discord.members.values()) {
            if (member.presence && member.presence.activities) {
                const activity = member.presence.activities.find((p) => p.name === "Twitch");

                if (activity && DiscordListener.#urlParse.test(activity.url)) {
                    const {groups: {user: twitchName}} = DiscordListener.#urlParse.exec(activity.url);
                    await DiscordListener.#streamers.add(member, activity, twitchName);
                }
            } else {
                await member.roles.remove(Discord.findRoleByName("Live"));
            }
        }
    }

    // MARK: static voiceStateUpdate
    /**
     * Handles when a user's voice state changes.
     * @param {DiscordJs.VoiceState} oldState The old voice state.
     * @param {DiscordJs.VoiceState} newState The new voice state.
     * @returns {void}
     */
    static voiceStateUpdate(oldState, newState) {
        if (oldState.channel) {
            if (oldState.channel.name !== "\u{1F4AC} General" && oldState.channel.members.size === 0) {
                DiscordListener.#vcm.markEmptyVoiceChannel(oldState.channel, true);
            }
        }

        if (newState.channel) {
            if (newState.channel.name !== "\u{1F4AC} General") {
                DiscordListener.#vcm.markEmptyVoiceChannel(newState.channel, false);
            }
        }
    }
}

module.exports = DiscordListener;
