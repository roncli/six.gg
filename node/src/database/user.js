/**
 * @typedef {import("discord.js").GuildMember} DiscordJs.GuildMember
 * @typedef {import("../../types/node/discordOAuthTypes").Connection} DiscordOAuthTypes.Connection
 * @typedef {import("../../types/node/discordOAuthTypes").TokenRequestResult} DiscordOAuthTypes.TokenRequestResult
 * @typedef {import("../../types/node/discordOAuthTypes").User} DiscordOAuthTypes.User
 * @typedef {import("express").Request} Express.Request
 * @typedef {import("../../types/node/sessionTypes").EncryptedMongoSessionData} SessionTypes.EncryptedMongoSessionData
 * @typedef {import("../../types/node/sessionTypes").EncryptedSessionData} SessionTypes.EncryptedSessionData
 * @typedef {import("../../types/node/sessionTypes").SessionData} SessionTypes.SessionData
 * @typedef {import("../models/user")} User
 * @typedef {import("../../types/node/userTypes").UserData} UserTypes.UserData
 * @typedef {import("../../types/node/userTypes").UserMongoData} UserTypes.UserMongoData
 */

const MongoDb = require("mongodb"),

    Db = require("."),
    Encryption = require("./encryption");

//  #   #                       ####   #
//  #   #                        #  #  #
//  #   #   ###    ###   # ##    #  #  # ##
//  #   #  #      #   #  ##  #   #  #  ##  #
//  #   #   ###   #####  #       #  #  #   #
//  #   #      #  #      #       #  #  ##  #
//   ###   ####    ###   #      ####   # ##
/**
 * A class to handle database calls for the user collection.
 */
class UserDb {
    //              #
    //              #
    //  ###   ##   ###
    // #  #  # ##   #
    //  ##   ##     #
    // #      ##     ##
    //  ###
    /**
     * Gets a user by their user ID.
     * @param {number} id The user ID.
     * @returns {Promise<UserTypes.UserData>} A promise that returns the user.
     */
    static async get(id) {
        const db = await Db.get();

        const user = await db.collection("user").findOne({_id: Db.toLong(id)});

        if (!user) {
            return void 0;
        }

        return {
            _id: Db.fromLong(user._id),
            discord: user.discord,
            guildMember: user.guildMember,
            connections: user.connections,
            location: user.location,
            timezone: user.timezone
        };
    }

    //              #     ##   ##    ##
    //              #    #  #   #     #
    //  ###   ##   ###   #  #   #     #
    // #  #  # ##   #    ####   #     #
    //  ##   ##     #    #  #   #     #
    // #      ##     ##  #  #  ###   ###
    //  ###
    /**
     * Gets all users from their DiscordIDs, removing any users that aren't in the list.
     * @param {string[]} discordIds The Discord IDs.
     * @returns {Promise<UserTypes.UserData[]>} A promise that returns the users.
     */
    static async getAll(discordIds) {
        const db = await Db.get();

        await db.collection("user").deleteMany({"discord.id": {$nin: discordIds}});

        const users = await db.collection("user").find().toArray();

        return users.map((u) => ({
            _id: Db.fromLong(u._id),
            discord: u.discord,
            guildMember: u.guildMember,
            connections: u.connections,
            location: u.location,
            timezone: u.timezone
        }));
    }

    //              #    ###         ###    #                                #  ###      #
    //              #    #  #        #  #                                    #   #       #
    //  ###   ##   ###   ###   #  #  #  #  ##     ###    ##    ##   ###    ###   #     ###
    // #  #  # ##   #    #  #  #  #  #  #   #    ##     #     #  #  #  #  #  #   #    #  #
    //  ##   ##     #    #  #   # #  #  #   #      ##   #     #  #  #     #  #   #    #  #
    // #      ##     ##  ###     #   ###   ###   ###     ##    ##   #      ###  ###    ###
    //  ###                     #
    /**
     * Gets the user by guild member.
     * @param {DiscordJs.GuildMember} member The guild member.
     * @returns {Promise<{user: UserTypes.UserData, session: SessionTypes.SessionData}>} A promise that returns the user and the session.
     */
    static async getByGuildMember(member) {
        const db = await Db.get();

        const encryptedData = /** @type {{user: UserTypes.UserMongoData, session: SessionTypes.EncryptedMongoSessionData}} */(await db.collection("session").aggregate([ // eslint-disable-line no-extra-parens
            {
                $match: {
                    "discord.id": member.id
                }
            },
            {
                $project: {
                    _id: 0,
                    session: "$$ROOT"
                }
            },
            {
                $lookup: {
                    from: "user",
                    localField: "session.userId",
                    foreignField: "_id",
                    as: "user"
                }
            },
            {
                $unwind: "$user"
            }
        ]).next());

        if (!encryptedData) {
            return void 0;
        }

        /** @type {{user: UserTypes.UserData, session: SessionTypes.EncryptedSessionData}} */
        const data = {
            user: {
                _id: Db.fromLong(encryptedData.user._id),
                discord: encryptedData.user.discord,
                guildMember: encryptedData.user.guildMember,
                connections: encryptedData.user.connections,
                location: encryptedData.user.location,
                timezone: encryptedData.user.timezone
            },
            session: {
                _id: encryptedData.session._id.toHexString(),
                ip: encryptedData.session.ip,
                userId: Db.fromLong(encryptedData.session.userId),
                accessToken: {
                    salt: encryptedData.session.accessToken.salt.buffer,
                    encrypted: encryptedData.session.accessToken.encrypted.buffer
                },
                refreshToken: {
                    salt: encryptedData.session.refreshToken.salt.buffer,
                    encrypted: encryptedData.session.refreshToken.encrypted.buffer
                },
                expires: encryptedData.session.expires
            }
        };

        return {
            user: data.user,
            session: {
                _id: data.session._id,
                ip: data.session.ip,
                userId: data.session.userId,
                accessToken: Encryption.decryptWithSalt(data.session.accessToken),
                refreshToken: Encryption.decryptWithSalt(data.session.refreshToken),
                expires: data.session.expires
            }
        };
    }

    //              #    ###         ####                     #     ##    #     #                   #
    //              #    #  #        #                        #    #  #   #     #                   #
    //  ###   ##   ###   ###   #  #  ###   # #    ##   ###   ###   #  #  ###   ###    ##   ###    ###   ##    ##    ###
    // #  #  # ##   #    #  #  #  #  #     # #   # ##  #  #   #    ####   #     #    # ##  #  #  #  #  # ##  # ##  ##
    //  ##   ##     #    #  #   # #  #     # #   ##    #  #   #    #  #   #     #    ##    #  #  #  #  ##    ##      ##
    // #      ##     ##  ###     #   ####   #     ##   #  #    ##  #  #    ##    ##   ##   #  #   ###   ##    ##   ###
    //  ###                     #
    /**
     * Gets an array of users that are attending an event.
     * @param {number} eventId The event ID to get the users for.
     * @returns {Promise<UserTypes.UserData[]>} A promise that returns a list of users that will be attending the event.
     */
    static async getByEventAttendees(eventId) {
        const db = await Db.get();

        const attendees = /** @type {UserTypes.UserMongoData[]} */(await db.collection("attendee").aggregate([ // eslint-disable-line no-extra-parens
            {
                $match: {
                    eventId: MongoDb.Long.fromNumber(eventId)
                }
            },
            {
                $lookup: {
                    from: "user",
                    localField: "userId",
                    foreignField: "_id",
                    as: "user"
                }
            },
            {
                $project: {
                    _id: 0,
                    user: 1
                }
            },
            {
                $unwind: "$user"
            },
            {
                $replaceRoot: {newRoot: "$user"}
            },
            {
                $project: {
                    discord: 1,
                    guildMember: 1
                }
            }
        ]).toArray());

        return attendees.map((a) => ({
            _id: Db.fromLong(a._id),
            discord: a.discord,
            guildMember: a.guildMember
        }));
    }

    //              #    ###          ##                        #
    //              #    #  #        #  #
    //  ###   ##   ###   ###   #  #   #     ##    ###    ###   ##     ##   ###
    // #  #  # ##   #    #  #  #  #    #   # ##  ##     ##      #    #  #  #  #
    //  ##   ##     #    #  #   # #  #  #  ##      ##     ##    #    #  #  #  #
    // #      ##     ##  ###     #    ##    ##   ###    ###    ###    ##   #  #
    //  ###                     #
    /**
     * Gets the user by the session.
     * @param {string} id The session ID.
     * @param {string} ip The user's IP address.
     * @returns {Promise<{user: UserTypes.UserData, session: SessionTypes.SessionData}>} A promise that returns the user and the session.
     */
    static async getBySession(id, ip) {
        const db = await Db.get();

        const encryptedData = /** @type {{user: UserTypes.UserMongoData, session: SessionTypes.EncryptedMongoSessionData}} */(await db.collection("session").aggregate([ // eslint-disable-line no-extra-parens
            {
                $match: {
                    _id: new MongoDb.ObjectId(id),
                    ip
                }
            },
            {
                $project: {
                    _id: 0,
                    session: "$$ROOT"
                }
            },
            {
                $lookup: {
                    from: "user",
                    localField: "session.userId",
                    foreignField: "_id",
                    as: "user"
                }
            },
            {
                $unwind: "$user"
            }
        ]).next());

        if (!encryptedData) {
            return void 0;
        }
        /** @type {{user: UserTypes.UserData, session: SessionTypes.EncryptedSessionData}} */
        const data = {
            user: {
                _id: Db.fromLong(encryptedData.user._id),
                discord: encryptedData.user.discord,
                guildMember: encryptedData.user.guildMember,
                connections: encryptedData.user.connections,
                location: encryptedData.user.location,
                timezone: encryptedData.user.timezone
            },
            session: {
                _id: encryptedData.session._id.toHexString(),
                ip: encryptedData.session.ip,
                userId: Db.fromLong(encryptedData.session.userId),
                accessToken: {
                    salt: encryptedData.session.accessToken.salt.buffer,
                    encrypted: encryptedData.session.accessToken.encrypted.buffer
                },
                refreshToken: {
                    salt: encryptedData.session.refreshToken.salt.buffer,
                    encrypted: encryptedData.session.refreshToken.encrypted.buffer
                },
                expires: encryptedData.session.expires
            }
        };

        return {
            user: data.user,
            session: {
                _id: data.session._id,
                ip: data.session.ip,
                userId: data.session.userId,
                accessToken: Encryption.decryptWithSalt(data.session.accessToken),
                refreshToken: Encryption.decryptWithSalt(data.session.refreshToken),
                expires: data.session.expires
            }
        };
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
     * @param {DiscordOAuthTypes.Connection[]} connections The user's Discord connections.
     * @param {DiscordOAuthTypes.TokenRequestResult} token The tokens.
     * @param {Express.Request} req The request.
     * @returns {Promise<{user: UserTypes.UserData, session: SessionTypes.SessionData}>} A promise that returns the user and the session.
     */
    static async set(user, guildMember, connections, token, req) {
        const db = await Db.get();

        /** @type {UserTypes.UserMongoData} */
        let userResult;
        if (await db.collection("user").findOne({"discord.id": user.id})) {
            const result = await db.collection("user").findOneAndUpdate({"discord.id": user.id}, {$set: {
                discord: {
                    id: user.id,
                    username: user.username,
                    discriminator: user.discriminator
                },
                guildMember: {
                    nick: guildMember.nickname,
                    joinedAt: guildMember.joinedAt
                },
                connections: connections.filter((c) => c.verified && !c.revoked && c.visibility !== 0).map((c) => ({
                    name: c.name,
                    id: c.id,
                    type: c.type
                }))
            }}, {returnDocument: "after"});

            userResult = result.value;
        } else {
            userResult = {
                _id: void 0,
                discord: {
                    id: user.id,
                    username: user.username,
                    discriminator: user.discriminator
                },
                guildMember: {
                    nick: guildMember.nickname,
                    joinedAt: guildMember.joinedAt
                },
                connections: connections.filter((c) => c.verified && !c.revoked && c.visibility !== 0).map((c) => ({
                    name: c.name,
                    id: c.id,
                    type: c.type
                })),
                timezone: process.env.DEFAULT_TIMEZONE
            };

            await Db.id(userResult, "user");

            await db.collection("user").insertOne(userResult);
        }

        const expires = new Date(),
            encryptedTokens = {
                accessToken: Encryption.encryptWithSalt(token.access_token),
                refreshToken: Encryption.encryptWithSalt(token.refresh_token)
            };

        expires.setSeconds(expires.getSeconds() + token.expires_in - 3600);

        const sessionResult = await db.collection("session").findOneAndUpdate({ip: req.ip, userId: userResult._id}, {$set: {
            ip: req.ip,
            userId: userResult._id,
            accessToken: {
                salt: new MongoDb.Binary(encryptedTokens.accessToken.salt),
                encrypted: new MongoDb.Binary(encryptedTokens.accessToken.encrypted)
            },
            refreshToken: {
                salt: new MongoDb.Binary(encryptedTokens.refreshToken.salt),
                encrypted: new MongoDb.Binary(encryptedTokens.refreshToken.encrypted)
            },
            expires
        }}, {upsert: true, returnDocument: "after"});

        return {
            user: {
                _id: Db.fromLong(userResult._id),
                discord: userResult.discord,
                guildMember: userResult.guildMember,
                connections: userResult.connections,
                location: userResult.location,
                timezone: userResult.timezone
            },
            session: {
                _id: sessionResult.value && sessionResult.value._id && sessionResult.value._id.toString() || sessionResult.lastErrorObject.upserted.toString(),
                ip: req.ip,
                userId: Db.fromLong(userResult._id),
                accessToken: token.access_token,
                refreshToken: token.refresh_token,
                expires
            }
        };
    }

    //               #    ###          #
    //               #    #  #         #
    //  ###    ##   ###   #  #   ###  ###    ###
    // ##     # ##   #    #  #  #  #   #    #  #
    //   ##   ##     #    #  #  # ##   #    # ##
    // ###     ##     ##  ###    # #    ##   # #
    /**
     * Sets the data for a user.
     * @param {User} user The user.
     * @param {object} data The data to set.
     * @returns {Promise} A promise that resolves when the data for the user has been set.
     */
    static async setData(user, data) {
        const db = await Db.get();

        await db.collection("user").findOneAndUpdate({_id: MongoDb.Long.fromNumber(user.id)}, {$set: data});
    }
}

module.exports = UserDb;
