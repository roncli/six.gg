/**
 * @typedef {import("discord.js").GuildMember} DiscordJs.GuildMember
 * @typedef {import("../../types/node/discordOAuthTypes").Connection} DiscordOAuthTypes.Connection
 * @typedef {import("../../types/node/discordOAuthTypes").TokenRequestResult} DiscordOAuthTypes.TokenRequestResult
 * @typedef {import("../../types/node/discordOAuthTypes").User} DiscordOAuthTypes.User
 * @typedef {import("express").Request} Express.Request
 * @typedef {import("../../types/node/sessionTypes").SessionData} SessionTypes.SessionData
 * @typedef {import("../../types/node/userTypes").UserData} UserTypes.UserData
 */

const DiscordUser = require("../discord/user"),
    Exception = require("../errors/exception"),
    SessionDb = require("../database/session"),
    UserDb = require("../database/user");

/** @type {typeof import("../discord")} */
let Discord;

setTimeout(() => {
    Discord = require("../discord");
}, 0);

//  #   #
//  #   #
//  #   #   ###    ###   # ##
//  #   #  #      #   #  ##  #
//  #   #   ###   #####  #
//  #   #      #  #      #
//   ###   ####    ###   #
/**
 * A class that represents a website user.
 */
class User {
    //              #    ###         ####                     #     ##    #     #                   #
    //              #    #  #        #                        #    #  #   #     #                   #
    //  ###   ##   ###   ###   #  #  ###   # #    ##   ###   ###   #  #  ###   ###    ##   ###    ###   ##    ##    ###
    // #  #  # ##   #    #  #  #  #  #     # #   # ##  #  #   #    ####   #     #    # ##  #  #  #  #  # ##  # ##  ##
    //  ##   ##     #    #  #   # #  #     # #   ##    #  #   #    #  #   #     #    ##    #  #  #  #  ##    ##      ##
    // #      ##     ##  ###     #   ####   #     ##   #  #    ##  #  #    ##    ##   ##   #  #   ###   ##    ##   ###
    //  ###                     #
    /**
     * Gets users that are attending an event by the event ID.
     * @param {number} eventId The event ID.
     * @returns {Promise<{user: User, guildMember: DiscordJs.GuildMember}[]>} A promise that returns the users attending the event.
     */
    static async getByEventAttendees(eventId) {
        let data;
        try {
            data = await UserDb.getByEventAttendees(eventId);
        } catch (err) {
            throw new Exception("There was an error while getting users by event ID.", err);
        }

        if (!data) {
            return [];
        }

        return data.map((d) => ({
            user: new User(d),
            guildMember: Discord.findGuildMemberById(d.discord.id)
        }));
    }

    //              #    ###          ##          #    ##       #  #  #              #
    //              #    #  #        #  #               #       #  ####              #
    //  ###   ##   ###   ###   #  #  #     #  #  ##     #     ###  ####   ##   # #   ###    ##   ###
    // #  #  # ##   #    #  #  #  #  # ##  #  #   #     #    #  #  #  #  # ##  ####  #  #  # ##  #  #
    //  ##   ##     #    #  #   # #  #  #  #  #   #     #    #  #  #  #  ##    #  #  #  #  ##    #
    // #      ##     ##  ###     #    ###   ###  ###   ###    ###  #  #   ##   #  #  ###    ##   #
    //  ###                     #
    /**
     * Gets a user by their Discord ID.
     * @param {DiscordJs.GuildMember} member The Discord ID.
     * @returns {Promise<User>} A promise that returns the user.
     */
    static async getByGuildMember(member) {
        let data;
        try {
            data = await UserDb.getByGuildMember(member);
        } catch (err) {
            throw new Exception("There was an error while getting the user by Discord ID.", err);
        }

        if (!data) {
            return void 0;
        }

        return new User(data.user, data.session);
    }

    //              #     ##                                  #
    //              #    #  #                                 #
    //  ###   ##   ###   #     #  #  ###   ###    ##   ###   ###
    // #  #  # ##   #    #     #  #  #  #  #  #  # ##  #  #   #
    //  ##   ##     #    #  #  #  #  #     #     ##    #  #   #
    // #      ##     ##   ##    ###  #     #      ##   #  #    ##
    //  ###
    /**
     * Gets the currently logged in user.
     * @param {Express.Request} req The request.
     * @returns {Promise<User>} A promise that returns the currently logged in user.
     */
    static async getCurrent(req) {
        const sessionId = req.cookies && req.cookies.sixGaming || void 0,
            ip = req.ip;

        if (!sessionId) {
            return void 0;
        }

        let data;
        try {
            data = await UserDb.getBySession(sessionId, ip);
        } catch (err) {
            throw new Exception("There was an error while getting the current user by session.", err);
        }

        if (!data) {
            return void 0;
        }

        if (data.session.expires < new Date()) {
            let token;
            try {
                token = await DiscordUser.refreshToken(data.session.refreshToken);
            } catch (err) {
                // Delete session, user was invalid.
                await SessionDb.delete(data.session._id);

                return void 0;
            }
            data.session.accessToken = token.access_token;
            data.session.refreshToken = token.refresh_token;
            data.session.expires = new Date();
            data.session.expires.setSeconds(data.session.expires.getSeconds() + token.expires_in - 3600);

            try {
                await SessionDb.update(data.session);
            } catch (err) {
                throw new Exception("There was an error while updating the current user's session.", err);
            }
        }

        return new User(data.user, data.session);
    }

    //              #    #  #              #
    //              #    ####              #
    //  ###   ##   ###   ####   ##   # #   ###    ##   ###
    // #  #  # ##   #    #  #  # ##  ####  #  #  # ##  #  #
    //  ##   ##     #    #  #  ##    #  #  #  #  ##    #
    // #      ##     ##  #  #   ##   #  #  ###    ##   #
    //  ###
    /**
     * Gets a member.
     * @param {number} id The user ID.
     * @returns {Promise<{guildMember: DiscordJs.GuildMember, user: User}>} A promise that returns the member.
     */
    static async getMember(id) {
        /** @type {UserTypes.UserData} */
        let user;
        try {
            user = await UserDb.get(id);
        } catch (err) {
            throw new Exception("There was an error while getting a member from the database.", err);
        }

        if (!user) {
            return void 0;
        }

        const guildMember = Discord.findGuildMemberById(user.discord.id);

        if (!guildMember) {
            return void 0;
        }

        return {
            guildMember,
            user: new User(user)
        };
    }

    //              #    #  #              #
    //              #    ####              #
    //  ###   ##   ###   ####   ##   # #   ###    ##   ###    ###
    // #  #  # ##   #    #  #  # ##  ####  #  #  # ##  #  #  ##
    //  ##   ##     #    #  #  ##    #  #  #  #  ##    #       ##
    // #      ##     ##  #  #   ##   #  #  ###    ##   #     ###
    //  ###
    /**
     * Gets a list of Six Gaming members.
     * @returns {Promise<{guildMember: DiscordJs.GuildMember, user: User}[]>} A promise that returns the list of members.
     */
    static async getMembers() {
        const members = Discord.members.array();

        /** @type {UserTypes.UserData[]} */
        let users;
        try {
            users = await UserDb.getAll(members.map((m) => m.id));
        } catch (err) {
            throw new Exception("There was an error while getting members from the database.", err);
        }

        return members.map((m) => {
            const user = users.find((u) => u.discord.id === m.id) || void 0;

            return {
                guildMember: m,
                user: user ? new User(user) : void 0
            };
        });
    }

    //               #
    //               #
    //  ###    ##   ###
    // ##     # ##   #
    //   ##   ##     #
    // ###     ##     ##
    /**
     * Sets a currently logged in user.
     * @param {DiscordOAuthTypes.User} user The Discord user.
     * @param {DiscordJs.GuildMember} guildMember The Discord guild member.
     * @param {DiscordOAuthTypes.Connection[]} connections The Discord connections.
     * @param {DiscordOAuthTypes.TokenRequestResult} token The tokens.
     * @param {Express.Request} req The request.
     * @returns {Promise<User>} A promise that returns the set user.
     */
    static async set(user, guildMember, connections, token, req) {
        let data;
        try {
            data = await UserDb.set(user, guildMember, connections, token, req);
        } catch (err) {
            throw new Exception("There was an error while setting the current user.", err);
        }

        return new User(data.user, data.session);
    }

    //                           #                       #
    //                           #                       #
    //  ##    ##   ###    ###   ###   ###   #  #   ##   ###    ##   ###
    // #     #  #  #  #  ##      #    #  #  #  #  #      #    #  #  #  #
    // #     #  #  #  #    ##    #    #     #  #  #      #    #  #  #
    //  ##    ##   #  #  ###      ##  #      ###   ##     ##   ##   #
    /**
     * Creates a new user object.
     * @param {UserTypes.UserData} user The user.
     * @param {SessionTypes.SessionData} [session] The session.
     */
    constructor(user, session) {
        this.id = user._id;
        this.discord = user.discord;
        this.guildMember = user.guildMember;
        this.connections = user.connections;
        this.location = user.location;
        this.timezone = user.timezone || process.env.DEFAULT_TIMEZONE;
        this.session = session;
    }

    //               #
    //               #
    //  ###    ##   ###
    // ##     # ##   #
    //   ##   ##     #
    // ###     ##     ##
    /**
     * Sets the data for a user.
     * @param {object} data The data to set.
     * @returns {Promise} A promise that resolves when the data for the user has been set.
     */
    async set(data) {
        if (!this.timezone) {
            this.timezone = process.env.DEFAULT_TIMEZONE;
        }

        try {
            await UserDb.setData(this, data);
            Object.keys(data).filter((key) => ["discord", "guildMember", "connections", "location", "timezone", "session"].indexOf(key) !== -1).forEach((key) => {
                this[key] = data[key];
            });
        } catch (err) {
            throw new Exception("There was an error while setting data on the user.", err);
        }
    }

    //               #    ###    #
    //               #     #
    //  ###    ##   ###    #    ##    # #    ##   ####   ##   ###    ##
    // ##     # ##   #     #     #    ####  # ##    #   #  #  #  #  # ##
    //   ##   ##     #     #     #    #  #  ##     #    #  #  #  #  ##
    // ###     ##     ##   #    ###   #  #   ##   ####   ##   #  #   ##
    /**
     * Sets the user's timezone.
     * @param {string} [timezone] The user's timezone.
     * @returns {Promise} A promise that resolves when the timezone is set.
     */
    async setTimezone(timezone) {
        if (!timezone) {
            timezone = process.env.DEFAULT_TIMEZONE;
        }

        try {
            await UserDb.setData(this, {timezone});
            this.timezone = timezone;
        } catch (err) {
            throw new Exception("There was an error while setting the timezone.", err);
        }
    }
}

module.exports = User;
