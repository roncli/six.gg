/**
 * @typedef {typeof import("./index")} Discord
 * @typedef {import("./voiceChannelManagement")} VoiceChannelManagement
 */

const Attendee = require("../models/attendee"),
    DiscordJs = require("discord.js"),
    Encoding = require("../../public/js/common/encoding"),
    Event = require("../models/event"),
    Exception = require("../errors/exception"),
    pjson = require("../../package.json"),
    tzdata = require("tzdata"),
    User = require("../models/user"),
    Warning = require("../errors/warning"),

    idMessageParse = /^<@!?(?<id>[0-9]+)> (?<command>[^ ]+)(?: (?<newMessage>.+))?$/,
    idParse = /^<@!?(?<id>[0-9]+)>$/;

/** @type {Discord} */
let Discord;

//   ###                                          #
//  #   #                                         #
//  #       ###   ## #   ## #    ###   # ##    ## #   ###
//  #      #   #  # # #  # # #      #  ##  #  #  ##  #
//  #      #   #  # # #  # # #   ####  #   #  #   #   ###
//  #   #  #   #  # # #  # # #  #   #  #   #  #  ##      #
//   ###    ###   #   #  #   #   ####  #   #   ## #  ####
/**
 * A class that handles commands given by chat.
 */
class Commands {
    //       #                 #      ##   #                             ##    ###           ##          ##
    //       #                 #     #  #  #                              #     #           #  #        #  #
    //  ##   ###    ##    ##   # #   #     ###    ###  ###   ###    ##    #     #     ###   #  #  ###    #     ##   ###   # #    ##   ###
    // #     #  #  # ##  #     ##    #     #  #  #  #  #  #  #  #  # ##   #     #    ##     #  #  #  #    #   # ##  #  #  # #   # ##  #  #
    // #     #  #  ##    #     # #   #  #  #  #  # ##  #  #  #  #  ##     #     #      ##   #  #  #  #  #  #  ##    #     # #   ##    #
    //  ##   #  #   ##    ##   #  #   ##   #  #   # #  #  #  #  #   ##   ###   ###   ###     ##   #  #   ##    ##   #      #     ##   #
    /**
     * Checks to ensure a channel is a challenge room.
     * @param {DiscordJs.TextChannel} channel The channel.
     * @returns {boolean} Whether the channel is on the correct server.
     */
    static checkChannelIsOnServer(channel) {
        return channel.type === DiscordJs.ChannelType.GuildText && channel.guild.name === process.env.DISCORD_GUILD;
    }

    //       #                 #     #  #               ###                                  #
    //       #                 #     #  #               #  #                                 #
    //  ##   ###    ##    ##   # #   ####   ###   ###   #  #   ###  ###    ###  # #    ##   ###    ##   ###    ###
    // #     #  #  # ##  #     ##    #  #  #  #  ##     ###   #  #  #  #  #  #  ####  # ##   #    # ##  #  #  ##
    // #     #  #  ##    #     # #   #  #  # ##    ##   #     # ##  #     # ##  #  #  ##     #    ##    #       ##
    //  ##   #  #   ##    ##   #  #  #  #   # #  ###    #      # #  #      # #  #  #   ##     ##   ##   #     ###
    /**
     * Checks to ensure a command has parameters.
     * @param {string} message The message sent.
     * @param {DiscordJs.GuildMember} member The member sending the command.
     * @param {string} text The text to display if parameters are found.
     * @param {DiscordJs.TextChannel} channel The channel to reply on.
     * @returns {Promise<boolean>} A promise that returns whether the check passed.
     */
    static async checkHasParameters(message, member, text, channel) {
        if (!message) {
            await Discord.queue(`Sorry, ${member}, but this command cannot be used by itself.  ${text}`, channel);
            return false;
        }

        return true;
    }

    //       #                 #     #  #              #                 ###           ##
    //       #                 #     ####              #                  #           #  #
    //  ##   ###    ##    ##   # #   ####   ##   # #   ###    ##   ###    #     ###   #  #  #  #  ###    ##   ###
    // #     #  #  # ##  #     ##    #  #  # ##  ####  #  #  # ##  #  #   #    ##     #  #  #  #  #  #  # ##  #  #
    // #     #  #  ##    #     # #   #  #  ##    #  #  #  #  ##    #      #      ##   #  #  ####  #  #  ##    #
    //  ##   #  #   ##    ##   #  #  #  #   ##   #  #  ###    ##   #     ###   ###     ##   ####  #  #   ##   #
    /**
     * Checks to ensure the member is the owner of the server.
     * @param {DiscordJs.GuildMember} member The member to check.
     * @returns {void}
     */
    static checkMemberIsOwner(member) {
        if (!Discord.isOwner(member)) {
            throw new Warning("Owner permission required to perform this command.");
        }
    }

    //       #                 #     #  #              #                 ###          #  #
    //       #                 #     ####              #                  #           #  #
    //  ##   ###    ##    ##   # #   ####   ##   # #   ###    ##   ###    #     ###   #  #   ###    ##   ###
    // #     #  #  # ##  #     ##    #  #  # ##  ####  #  #  # ##  #  #   #    ##     #  #  ##     # ##  #  #
    // #     #  #  ##    #     # #   #  #  ##    #  #  #  #  ##    #      #      ##   #  #    ##   ##    #
    //  ##   #  #   ##    ##   #  #  #  #   ##   #  #  ###    ##   #     ###   ###     ##   ###     ##   #
    /**
     * Checks to ensure the member is a web site user.
     * @param {DiscordJs.GuildMember} member The member to check.
     * @param {DiscordJs.TextChannel} channel The channel to reply on.
     * @returns {Promise<User>} A promise that returns the user.
     */
    static async checkMemberIsUser(member, channel) {
        const user = await User.getByGuildMember(member);

        if (!user) {
            await Discord.queue(`Sorry, ${member}, but you must link your Discord to Six Gaming first.  Visit https://${process.env.DOMAIN}/join to link your account.`, channel);
            throw new Warning("A user account is required to perform this command.");
        }

        return user;
    }

    //       #                 #     #  #        ###                                  #
    //       #                 #     ## #        #  #                                 #
    //  ##   ###    ##    ##   # #   ## #   ##   #  #   ###  ###    ###  # #    ##   ###    ##   ###    ###
    // #     #  #  # ##  #     ##    # ##  #  #  ###   #  #  #  #  #  #  ####  # ##   #    # ##  #  #  ##
    // #     #  #  ##    #     # #   # ##  #  #  #     # ##  #     # ##  #  #  ##     #    ##    #       ##
    //  ##   #  #   ##    ##   #  #  #  #   ##   #      # #  #      # #  #  #   ##     ##   ##   #     ###
    /**
     * Checks to ensure a command has no parameters.
     * @param {string} message The message sent.
     * @param {DiscordJs.GuildMember} member The member sending the command.
     * @param {string} text The text to display if parameters are found.
     * @param {DiscordJs.TextChannel} channel The channel to reply on.
     * @returns {Promise<boolean>} A promise that returns whether the check passed.
     */
    static async checkNoParameters(message, member, text, channel) {
        if (message) {
            await Discord.queue(`Sorry, ${member}, but this command does not take any parameters.  ${text}`, channel);
            return false;
        }

        return true;
    }

    //       #                 #     ###    #                                        ###          #  #        ##     #       #
    //       #                 #      #                                               #           #  #         #             #
    //  ##   ###    ##    ##   # #    #    ##    # #    ##   ####   ##   ###    ##    #     ###   #  #   ###   #    ##     ###
    // #     #  #  # ##  #     ##     #     #    ####  # ##    #   #  #  #  #  # ##   #    ##     #  #  #  #   #     #    #  #
    // #     #  #  ##    #     # #    #     #    #  #  ##     #    #  #  #  #  ##     #      ##    ##   # ##   #     #    #  #
    //  ##   #  #   ##    ##   #  #   #    ###   #  #   ##   ####   ##   #  #   ##   ###   ###     ##    # #  ###   ###    ###
    /**
     * Checks to ensure a time zone is valid.
     * @param {string} message The message sent.
     * @param {DiscordJs.GuildMember} member The player sending the command.
     * @param {DiscordJs.TextChannel} channel The channel to reply on.
     * @returns {Promise<string>} A promise that returns the time in the specified time zone.
     */
    static async checkTimezoneIsValid(message, member, channel) {
        if (!tzdata.zones[message]) {
            await Discord.queue(`Sorry, ${member}, but that time zone is not recognized.  Please note that this command is case sensitive.  See #timezone-faq for a complete list of time zones.`, channel);
            throw new Warning("Invalid time zone.");
        }

        let time;
        try {
            time = new Date().toLocaleString("en-US", {timeZone: message, hour12: true, hour: "numeric", minute: "2-digit", timeZoneName: "short"});
        } catch (err) {
            await Discord.queue(`Sorry, ${member}, but that time zone is not recognized.  Please note that this command is case sensitive.  See #timezone-faq for a complete list of time zones.`, channel);
            throw new Warning("Invalid time zone.");
        }

        return time;
    }

    //                           #                       #
    //                           #                       #
    //  ##    ##   ###    ###   ###   ###   #  #   ##   ###    ##   ###
    // #     #  #  #  #  ##      #    #  #  #  #  #      #    #  #  #  #
    // #     #  #  #  #    ##    #    #     #  #  #      #    #  #  #
    //  ##    ##   #  #  ###      ##  #      ###   ##     ##   ##   #
    /**
     * Creates an instance of the command handler.
     * @param {Discord} discord The Discord object.
     * @param {VoiceChannelManagement} vcm The voice channel manager.
     */
    constructor(discord, vcm) {
        if (!Discord) {
            Discord = discord;
        }

        this.vcm = vcm;
    }

    //         #                ##           #
    //                           #           #
    //  ###   ##    # #   #  #   #     ###  ###    ##
    // ##      #    ####  #  #   #    #  #   #    # ##
    //   ##    #    #  #  #  #   #    # ##   #    ##
    // ###    ###   #  #   ###  ###    # #    ##   ##
    /**
     * Simulates other users making a command.
     * @param {DiscordJs.GuildMember} member The guild member initiating the command.
     * @param {DiscordJs.TextChannel} channel The channel the message was sent over.
     * @param {string} message The text of the command.
     * @returns {Promise<boolean>} A promise that returns whether the command completed successfully.
     */
    async simulate(member, channel, message) {
        await Commands.checkMemberIsOwner(member);

        if (!idMessageParse.test(message)) {
            return false;
        }

        const {groups: {id, command, newMessage}} = idMessageParse.exec(message);
        if (Object.getOwnPropertyNames(Commands.prototype).filter((p) => typeof Commands.prototype[p] === "function" && p !== "constructor").indexOf(command) === -1) {
            throw new Warning("Invalid command.");
        }

        const newMember = await Discord.findGuildMemberById(id);
        if (!newMember) {
            throw new Warning("User does not exist on the server.");
        }

        return await this[command](newMember, channel, newMessage) || void 0;
    }

    // #           ##
    // #            #
    // ###    ##    #    ###
    // #  #  # ##   #    #  #
    // #  #  ##     #    #  #
    // #  #   ##   ###   ###
    //                   #
    /**
     * Replies with a URL to the bot's help page.
     * @param {DiscordJs.GuildMember} member The guild member initiating the command.
     * @param {DiscordJs.TextChannel} channel The channel the message was sent over.
     * @param {string} message The text of the command.
     * @returns {Promise<boolean>} A promise that returns whether the command completed successfully.
     */
    async help(member, channel, message) {
        if (!Commands.checkChannelIsOnServer(channel)) {
            return false;
        }

        if (message) {
            return false;
        }

        await Discord.queue(`${member}, see the about page https://${process.env.DOMAIN}/about.`, channel);
        return true;
    }

    //                           #
    //
    // # #    ##   ###    ###   ##     ##   ###
    // # #   # ##  #  #  ##      #    #  #  #  #
    // # #   ##    #       ##    #    #  #  #  #
    //  #     ##   #     ###    ###    ##   #  #
    /**
     * Replies with the current version of the bot.
     * @param {DiscordJs.GuildMember} member The user initiating the command.
     * @param {DiscordJs.TextChannel} channel The channel the message was sent over.
     * @param {string} message The text of the command.
     * @returns {Promise<boolean>} A promise that returns whether the command completed successfully.
     */
    async version(member, channel, message) {
        if (!Commands.checkChannelIsOnServer(channel)) {
            return false;
        }

        if (message) {
            return false;
        }

        await Discord.queue(`Six Gaming.  Messy but effective.  By roncli, Version ${pjson.version}.  Project is open source, visit https://github.com/roncli/six.gg.`, channel);
        return true;
    }

    //             #             #     #
    //             #                   #
    // #  #   ##   ###    ###   ##    ###    ##
    // #  #  # ##  #  #  ##      #     #    # ##
    // ####  ##    #  #    ##    #     #    ##
    // ####   ##   ###   ###    ###     ##   ##
    /**
     * Replies with OTL's Website URL.
     * @param {DiscordJs.GuildMember} member The user initiating the command.
     * @param {DiscordJs.TextChannel} channel The channel the message was sent over.
     * @param {string} message The text of the command.
     * @returns {Promise<boolean>} A promise that returns whether the command completed successfully.
     */
    async website(member, channel, message) {
        if (!Commands.checkChannelIsOnServer(channel)) {
            return false;
        }

        if (message) {
            return false;
        }

        await Discord.queue(`We have a website?  Yes!  Visit our website at https://${process.env.DOMAIN} for more about Six Gaming!`, channel);
        return true;
    }

    //  #     #
    //  #
    // ###   ##    # #    ##   ####   ##   ###    ##
    //  #     #    ####  # ##    #   #  #  #  #  # ##
    //  #     #    #  #  ##     #    #  #  #  #  ##
    //   ##  ###   #  #   ##   ####   ##   #  #   ##
    /**
     * Sets the user's timezone.
     * @param {DiscordJs.GuildMember} member The user initiating the command.
     * @param {DiscordJs.TextChannel} channel The channel the message was sent over.
     * @param {string} message The text of the command.
     * @returns {Promise<boolean>} A promise that returns whether the command completed successfully.
     */
    async timezone(member, channel, message) {
        if (!Commands.checkChannelIsOnServer(channel)) {
            return false;
        }

        const user = await Commands.checkMemberIsUser(member, channel);

        if (message) {
            const time = await Commands.checkTimezoneIsValid(message, member, channel);

            try {
                await user.setTimezone(message);
            } catch (err) {
                await Discord.queue(`Sorry, ${member}, but there was a server error.  An admin will be notified about this.`, channel);
                throw err;
            }

            await Discord.queue(`${member}, your time zone has been set to ${message}, where the current local time is ${time}.`, channel);
            return true;
        }

        try {
            await user.setTimezone();
        } catch (err) {
            await Discord.queue(`Sorry, ${member}, but there was a server error.  An admin will be notified about this.`, channel);
            throw err;
        }

        await Discord.queue(`${member}, your time zone has been cleared.`, channel);
        return true;
    }

    //          #     #        #                             ##
    //          #     #        #                              #
    //  ###   ###   ###   ##   ###    ###  ###   ###    ##    #
    // #  #  #  #  #  #  #     #  #  #  #  #  #  #  #  # ##   #
    // # ##  #  #  #  #  #     #  #  # ##  #  #  #  #  ##     #
    //  # #   ###   ###   ##   #  #   # #  #  #  #  #   ##   ###
    /**
     * Adds a voice channel to Discord.
     * @param {DiscordJs.GuildMember} member The user initiating the command.
     * @param {DiscordJs.TextChannel} channel The channel the message was sent over.
     * @param {string} message The text of the command.
     * @returns {Promise<boolean>} A promise that returns whether the command completed successfully.
     */
    async addchannel(member, channel, message) {
        if (!Commands.checkChannelIsOnServer(channel)) {
            return false;
        }

        if (!await Commands.checkHasParameters(message, member, "Use `!addchannel` followed by the name of the voice channel you would like to create.", channel)) {
            return false;
        }

        if (!this.vcm.canCreateChannel(member)) {
            await Discord.queue(`Sorry, ${member}, but you can only create a voice channel once every five minutes.`, channel);
            throw new Warning("Can only create a voice channel once every 5 minutes.");
        }

        if (Discord.findChannelByName(message)) {
            await Discord.queue(`Sorry, ${member}, but ${message} already exists as a voice channel.`, channel);
            throw new Warning("Channel already exists.");
        }

        let newChannel;
        try {
            newChannel = await this.vcm.create(member, message);
        } catch (err) {
            await Discord.queue(`Sorry, ${message}, but something broke.  Try later, or get a hold of @roncli for fixing.`, channel);
            throw new Exception("There was a Discord error while attempting to create a voice channel.", err);
        }

        await Discord.queue(`${member}, the voice channel ${newChannel} has been created.  It will be automatically deleted after being empty for 5 minutes.`, channel);

        return true;
    }

    // ##     #           #     #
    //  #                       #
    //  #    ##    # #   ##    ###
    //  #     #    ####   #     #
    //  #     #    #  #   #     #
    // ###   ###   #  #  ###     ##
    /**
     * Limits the number of users in a voice channel.
     * @param {DiscordJs.GuildMember} member The user initiating the command.
     * @param {DiscordJs.TextChannel} channel The channel the message was sent over.
     * @param {string} message The text of the command.
     * @returns {Promise<boolean>} A promise that returns whether the command completed successfully.
     */
    async limit(member, channel, message) {
        if (!Commands.checkChannelIsOnServer(channel)) {
            return false;
        }

        if (!await Commands.checkHasParameters(message, member, "Use `!limit` followed by the maximum number of people you would like to have join your channel.", channel)) {
            return false;
        }

        if (!(+message || void 0) || +message < 0 || +message > 99 || +message % 1 !== 0) {
            await Discord.queue(`Sorry, ${member}, but to limit the number of users in your newly created channel, you must include the number of users between 1 and 99, or 0 for no limit, for example \`!limit 2\`.`, channel);
            throw new Warning("Invalid parameters.");
        }

        const createdChannel = await this.vcm.getCreatedChannel(member);
        if (!createdChannel) {
            await Discord.queue(`Sorry, ${member}, but I don't see a channel you've created recently.  You can create a new channel with \`!addchannel\`.`, channel);
        }

        try {
            await createdChannel.setUserLimit(+message);
        } catch (err) {
            await Discord.queue(`Sorry, ${message}, but something broke.  Try later, or get a hold of @roncli for fixing.`, channel);
            throw new Exception("There was a Discord error while attempting to limit a voice channel.", err);
        }

        if (+message === 0) {
            await Discord.queue(`${member}, ${createdChannel} no longer has a cap on members who can join.`, channel);
        } else {
            await Discord.queue(`${member}, ${createdChannel} is now capped to ${+message} members.`, channel);
        }

        return true;
    }

    //              #                 #
    //                                #
    // ###   ###   ##    # #    ###  ###    ##
    // #  #  #  #   #    # #   #  #   #    # ##
    // #  #  #      #    # #   # ##   #    ##
    // ###   #     ###    #     # #    ##   ##
    // #
    /**
     * Makes a voice channel private.
     * @param {DiscordJs.GuildMember} member The user initiating the command.
     * @param {DiscordJs.TextChannel} channel The channel the message was sent over.
     * @param {string} message The text of the command.
     * @returns {Promise<boolean>} A promise that returns whether the command completed successfully.
     */
    async private(member, channel, message) {
        if (!Commands.checkChannelIsOnServer(channel)) {
            return false;
        }

        if (!await Commands.checkNoParameters(message, member, "Use `!private` by itself to make your voice channel private.", channel)) {
            return false;
        }

        const createdChannel = await this.vcm.getCreatedChannel(member);
        if (!createdChannel) {
            await Discord.queue(`Sorry, ${member}, but I don't see a channel you've created recently.  You can create a new channel with \`!addchannel\`.`, channel);
        }

        try {
            await createdChannel.permissionOverwrites.create(Discord.id, {Connect: false});
            await createdChannel.permissionOverwrites.create(member, {Connect: true});
        } catch (err) {
            await Discord.queue(`Sorry, ${message}, but something broke.  Try later, or get a hold of @roncli for fixing.`, channel);
            throw new Exception("There was a Discord error while attempting to make a voice channel private.", err);
        }

        await Discord.queue(`${member}, ${createdChannel} is now private.`, channel);

        return true;
    }

    //                          #     #
    //                                #
    // ###    ##   ###   # #   ##    ###
    // #  #  # ##  #  #  ####   #     #
    // #  #  ##    #     #  #   #     #
    // ###    ##   #     #  #  ###     ##
    // #
    /**
     * Permits a user to join a voice channel.
     * @param {DiscordJs.GuildMember} member The user initiating the command.
     * @param {DiscordJs.TextChannel} channel The channel the message was sent over.
     * @param {string} message The text of the command.
     * @returns {Promise<boolean>} A promise that returns whether the command completed successfully.
     */
    async permit(member, channel, message) {
        if (!Commands.checkChannelIsOnServer(channel)) {
            return false;
        }

        if (!await Commands.checkHasParameters(message, member, "Use `!permit` followed by the user you want to permit in your channel, for example `!permit @roncli`.", channel)) {
            return false;
        }

        if (!idParse.test(message)) {
            await Discord.queue(`Sorry, ${member}, but you need to mention a user with this command, for example \`!permit @roncli\`.`, channel);
            throw new Warning("No user mentioned.");
        }

        const {groups: {id}} = idParse.exec(message),
            permitMember = Discord.findGuildMemberById(id);

        if (!member) {
            await Discord.queue(`Sorry, ${member}, but I can't find a member by that name on this server.`, channel);
            throw new Warning("Member not on the server.");
        }

        const createdChannel = this.vcm.getCreatedChannel(member);
        if (!createdChannel) {
            await Discord.queue(`Sorry, ${member}, but I don't see a channel you've created recently.  You can create a new channel with \`!addchannel\`.`, channel);
        }

        try {
            await createdChannel.permissionOverwrites.create(permitMember, {Connect: true});
        } catch (err) {
            await Discord.queue(`Sorry, ${message}, but something broke.  Try later, or get a hold of @roncli for fixing.`, channel);
            throw new Exception("There was a Discord error while attempting to permit a user to a voice channel.", err);
        }

        await Discord.queue(`${member}, ${permitMember} is now permitted to join ${createdChannel}.`, channel);

        return true;
    }

    //   #          #

    //   #    ##   ##    ###
    //   #   #  #   #    #  #
    //   #   #  #   #    #  #
    // # #    ##   ###   #  #
    //  #
    /**
     * Joins the user to an event.
     * @param {DiscordJs.GuildMember} member The user initiating the command.
     * @param {DiscordJs.TextChannel} channel The channel the message was sent over.
     * @param {string} message The text of the command.
     * @returns {Promise<boolean>} A promise that returns whether the command completed successfully.
     */
    async join(member, channel, message) {
        if (!Commands.checkChannelIsOnServer(channel)) {
            return false;
        }

        const user = await Commands.checkMemberIsUser(member, channel);

        if (!await Commands.checkHasParameters(message, member, `Use \`!join\` followed by the event ID of the event that you would like to join, for examples \`!join 1\`.  The event ID is listed in the ${Discord.findChannelByName("event-announcements")} channel.`, channel)) {
            return false;
        }

        const eventId = +message;

        if (!eventId || isNaN(eventId) || eventId <= 0) {
            await Discord.queue(`Sorry, ${member}, but that is an invalid event ID.`, channel);
            throw new Warning("Invalid event ID.");
        }

        const event = await Event.get(eventId);

        if (!event) {
            await Discord.queue(`Sorry, ${member}, but that is an invalid event ID.`, channel);
            throw new Warning("Invalid event ID.");
        }

        await Attendee.add(eventId, user.id);

        await Discord.queue(`${member}, you are now scheduled to join **${Encoding.discordEncode(event.title)}** on ${event.start.toLocaleString("en-US", {timeZone: user.timezone || process.env.DEFAULT_TIMEZONE, hour12: true, month: "numeric", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit", timeZoneName: "short"})}.  You will receive a reminder 30 minutes before the event begins.  You can use the command \`!leave ${event.id}\` to leave this event.`, channel);

        return true;
    }

    // ##
    //  #
    //  #     ##    ###  # #    ##
    //  #    # ##  #  #  # #   # ##
    //  #    ##    # ##  # #   ##
    // ###    ##    # #   #     ##
    /**
     * Leaves the user from an event.
     * @param {DiscordJs.GuildMember} member The user initiating the command.
     * @param {DiscordJs.TextChannel} channel The channel the message was sent over.
     * @param {string} message The text of the command.
     * @returns {Promise<boolean>} A promise that returns whether the command completed successfully.
     */
    async leave(member, channel, message) {
        if (!Commands.checkChannelIsOnServer(channel)) {
            return false;
        }

        const user = await Commands.checkMemberIsUser(member, channel);

        if (!await Commands.checkHasParameters(message, member, `Use \`!leave\` followed by the event ID of the event that you would like to leave, for examples \`!leave 1\`.  The event ID is listed in the ${Discord.findChannelByName("event-announcements")} channel.`, channel)) {
            return false;
        }

        const eventId = +message;

        if (!eventId || isNaN(eventId) || eventId <= 0) {
            await Discord.queue(`Sorry, ${member}, but that is an invalid event ID.`, channel);
            throw new Warning("Invalid event ID.");
        }

        const event = await Event.get(eventId);

        if (!event) {
            await Discord.queue(`Sorry, ${member}, but that is an invalid event ID.`, channel);
            throw new Warning("Invalid event ID.");
        }

        await Attendee.remove(eventId, user.id);

        await Discord.queue(`${member}, you are no longer scheduled to join **${Encoding.discordEncode(event.title)}** on ${event.start.toLocaleString("en-US", {timeZone: user.timezone || process.env.DEFAULT_TIMEZONE, hour12: true, month: "numeric", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit", timeZoneName: "short"})}.  You can use the command \`!join ${event.id}\` to rejoin this event.`, channel);

        return true;
    }
}

module.exports = Commands;
