/**
 * @typedef {import("discord.js").Message} DiscordJs.Message
 * @typedef {import("discord.js").Presence} DiscordJs.Presence
 * @typedef {import("discord.js").VoiceChannel} DiscordJs.VoiceChannel
 * @typedef {import("discord.js").VoiceState} DiscordJs.VoiceState
 */

const Commands = require("../discord/commands"),
    Discord = require("../discord"),
    Exception = require("../logging/exception"),
    Log = require("../logging/log"),
    Streamers = require("../discord/streamers"),
    Twitch = require("../twitch"),
    VoiceChannelManagement = require("../discord/voiceChannelManagement"),
    Warning = require("../logging/warning"),

    messageParse = /^!(?<cmd>[^ ]+)(?: +(?<args>.*[^ ]))? *$/,
    urlParse = /^https:\/\/www.twitch.tv\/(?<user>.+)$/;

/** @type {Commands} */
let commands;

/** @type {Streamers} */
let streamers;

/** @type {VoiceChannelManagement} */
let vcm;

//  ####     #                                    #  #        #            #
//   #  #                                         #  #                     #
//   #  #   ##     ###    ###    ###   # ##    ## #  #       ##     ###   ####    ###   # ##    ###   # ##
//   #  #    #    #      #   #  #   #  ##  #  #  ##  #        #    #       #     #   #  ##  #  #   #  ##  #
//   #  #    #     ###   #      #   #  #      #   #  #        #     ###    #     #####  #   #  #####  #
//   #  #    #        #  #   #  #   #  #      #  ##  #        #        #   #  #  #      #   #  #      #
//  ####    ###   ####    ###    ###   #       ## #  #####   ###   ####     ##    ###   #   #   ###   #
/**
 * A class that handles listening to Discord events.
 */
class DiscordListener {
    //         #
    //         #
    //  ###   ###   ###    ##    ###  # #    ##   ###    ###
    // ##      #    #  #  # ##  #  #  ####  # ##  #  #  ##
    //   ##    #    #     ##    # ##  #  #  ##    #       ##
    // ###      ##  #      ##    # #  #  #   ##   #     ###
    /**
     * Returns the streamers object.
     * @returns {Streamers} The streamers object.
     */
    static get streamers() {
        return streamers;
    }

    //              #                 ##   #                             ##    #  #                                                   #
    //                               #  #  #                              #    ####                                                   #
    // # #    ##   ##     ##    ##   #     ###    ###  ###   ###    ##    #    ####   ###  ###    ###   ###   ##   # #    ##   ###   ###
    // # #   #  #   #    #     # ##  #     #  #  #  #  #  #  #  #  # ##   #    #  #  #  #  #  #  #  #  #  #  # ##  ####  # ##  #  #   #
    // # #   #  #   #    #     ##    #  #  #  #  # ##  #  #  #  #  ##     #    #  #  # ##  #  #  # ##   ##   ##    #  #  ##    #  #   #
    //  #     ##   ###    ##    ##    ##   #  #   # #  #  #  #  #   ##   ###   #  #   # #  #  #   # #  #      ##   #  #   ##   #  #    ##
    //                                                                                                  ###
    /**
     * Returns the voice channel management object.
     * @returns {VoiceChannelManagement} The voice channel management object.
     */
    static get voiceChannelManagement() {
        return vcm;
    }

    // # #    ##    ###    ###    ###   ###   ##
    // ####  # ##  ##     ##     #  #  #  #  # ##
    // #  #  ##      ##     ##   # ##   ##   ##
    // #  #   ##   ###    ###     # #  #      ##
    //                                  ###
    /**
     * Handles when a message is posted in Discord.
     * @param {DiscordJs.Message} message The message.
     * @returns {Promise} A promise that resolves when the event has been processed.
     */
    static async message(message) {
        const member = Discord.findGuildMemberById(message.author.id);

        for (const text of message.content.split("\n")) {
            if (!messageParse.test(text)) {
                continue;
            }

            const {groups: {cmd, args}} = messageParse.exec(text),
                command = cmd.toLocaleLowerCase();

            if (Object.getOwnPropertyNames(Commands.prototype).filter((p) => typeof Commands.prototype[p] === "function" && p !== "constructor").indexOf(command) !== -1) {
                let success;
                try {
                    success = await commands[command](member, message.channel, args);
                } catch (err) {
                    if (err instanceof Warning) {
                        Log.warning(`${message.channel} ${member}: ${text} - ${err.message || err}`);
                    } else if (err instanceof Exception) {
                        Log.exception(`${message.channel} ${member}: ${text} - ${err.message}`, err.innerError);
                    } else {
                        Log.exception(`${message.channel} ${member}: ${text}`, err);
                    }

                    return;
                }

                if (success) {
                    Log.log(`${message.channel} ${member}: ${text}`);
                }
            }
        }
    }

    //                                                  #  #           #         #
    //                                                  #  #           #         #
    // ###   ###    ##    ###    ##   ###    ##    ##   #  #  ###    ###   ###  ###    ##
    // #  #  #  #  # ##  ##     # ##  #  #  #     # ##  #  #  #  #  #  #  #  #   #    # ##
    // #  #  #     ##      ##   ##    #  #  #     ##    #  #  #  #  #  #  # ##   #    ##
    // ###   #      ##   ###     ##   #  #   ##    ##    ##   ###    ###   # #    ##   ##
    // #                                                      #
    /**
     * Handles when a user's Discord presence is updated.
     * @param {DiscordJs.Presence} oldPresence The old presence state.
     * @param {DiscordJs.Presence} newPresence The new presence state.
     * @returns {Promise} A promise that resolves when the event has been processed.
     */
    static async presenceUpdate(oldPresence, newPresence) {
        if (newPresence && newPresence.activities && newPresence.member && newPresence.guild && newPresence.guild.id === Discord.id) {
            const oldActivity = oldPresence && oldPresence.activities && oldPresence.activities.find((p) => p.name === "Twitch") || void 0,
                activity = newPresence.activities.find((p) => p.name === "Twitch");

            if (activity && urlParse.test(activity.url)) {
                if (!oldActivity) {
                    const {groups: {user: twitchName}} = urlParse.exec(activity.url);
                    await streamers.add(newPresence.member, activity, twitchName, true);
                }
            } else {
                await streamers.remove(newPresence.member);
            }
        }
    }

    //                      #
    //                      #
    // ###    ##    ###   ###  #  #
    // #  #  # ##  #  #  #  #  #  #
    // #     ##    # ##  #  #   # #
    // #      ##    # #   ###    #
    //                          #
    /**
     * Handles when Discord is ready.
     * @returns {Promise} A promise that resolves when the event has been processed.
     */
    static async ready() {
        vcm = new VoiceChannelManagement(Discord);
        commands = new Commands(Discord, vcm);
        streamers = new Streamers(Discord, Twitch);

        Discord.channels.filter((channel) => channel.type === "voice").forEach((/** @type {DiscordJs.VoiceChannel} */ channel) => {
            if (channel.name !== "\u{1F4AC} General" && channel.members.size === 0) {
                vcm.markEmptyVoiceChannel(channel, true);
            }
        });

        for (const member of Discord.members.values()) {
            if (member.presence && member.presence.activities) {
                const activity = member.presence.activities.find((p) => p.name === "Twitch");

                if (activity && urlParse.test(activity.url)) {
                    const {groups: {user: twitchName}} = urlParse.exec(activity.url);
                    await streamers.add(member, activity, twitchName);
                }
            } else {
                await member.roles.remove(Discord.findRoleByName("Live"));
            }
        }
    }

    //              #                 ##    #           #          #  #           #         #
    //                               #  #   #           #          #  #           #         #
    // # #    ##   ##     ##    ##    #    ###    ###  ###    ##   #  #  ###    ###   ###  ###    ##
    // # #   #  #   #    #     # ##    #    #    #  #   #    # ##  #  #  #  #  #  #  #  #   #    # ##
    // # #   #  #   #    #     ##    #  #   #    # ##   #    ##    #  #  #  #  #  #  # ##   #    ##
    //  #     ##   ###    ##    ##    ##     ##   # #    ##   ##    ##   ###    ###   # #    ##   ##
    //                                                                   #
    /**
     * Handles when a user's voice state changes.
     * @param {DiscordJs.VoiceState} oldState The old voice state.
     * @param {DiscordJs.VoiceState} newState The new voice state.
     * @returns {void}
     */
    static voiceStateUpdate(oldState, newState) {
        if (oldState.channel) {
            if (oldState.channel.name !== "\u{1F4AC} General" && oldState.channel.members.size === 0) {
                vcm.markEmptyVoiceChannel(oldState.channel, true);
            }
        }

        if (newState.channel) {
            if (newState.channel.name !== "\u{1F4AC} General") {
                vcm.markEmptyVoiceChannel(newState.channel, false);
            }
        }
    }
}

module.exports = DiscordListener;
