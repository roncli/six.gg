/**
 * @typedef {import("../../types/node/twitchTypes").EncryptedMongoTokens} TwitchTypes.EncryptedMongoTokens
 * @typedef {import("../../types/node/twitchTypes").EncryptedTokens} TwitchTypes.EncryptedTokens
 * @typedef {import("../../types/node/twitchTypes").Tokens} TwitchTypes.Tokens
 */

const Db = require("."),
    Encryption = require("./encryption"),
    MongoDb = require("mongodb");

// MARK: class TwitchDb
/**
 * A class to handle database calls for the twitch collection.
 */
class TwitchDb {
    // MARK: static async get
    /**
     * Gets the Twitch variables.
     * @returns {Promise<TwitchTypes.Tokens>} A promise that returns the Twitch variables.
     */
    static async get() {
        const db = await Db.get();

        const encryptedTokens = await db.collection("twitch").findOne({});

        if (!encryptedTokens) {
            return void 0;
        }

        /** @type {TwitchTypes.EncryptedTokens} */
        const tokens = {
            botAccessToken: {
                salt: encryptedTokens.botAccessToken.salt.buffer,
                encrypted: encryptedTokens.botAccessToken.encrypted.buffer
            },
            botRefreshToken: {
                salt: encryptedTokens.botRefreshToken.salt.buffer,
                encrypted: encryptedTokens.botRefreshToken.encrypted.buffer
            },
            channelAccessToken: {
                salt: encryptedTokens.channelAccessToken.salt.buffer,
                encrypted: encryptedTokens.channelAccessToken.encrypted.buffer
            },
            channelRefreshToken: {
                salt: encryptedTokens.channelRefreshToken.salt.buffer,
                encrypted: encryptedTokens.channelRefreshToken.encrypted.buffer
            }
        };

        return {
            botAccessToken: Encryption.decryptWithSalt(tokens.botAccessToken),
            botRefreshToken: Encryption.decryptWithSalt(tokens.botRefreshToken),
            channelAccessToken: Encryption.decryptWithSalt(tokens.channelAccessToken),
            channelRefreshToken: Encryption.decryptWithSalt(tokens.channelRefreshToken)
        };
    }

    // MARK: static async set
    /**
     * Sets the Twitch variables.
     * @param {TwitchTypes.Tokens} tokens The tokens to set.
     * @returns {Promise<void>}
     */
    static async set(tokens) {
        const db = await Db.get();

        const encryptedTokens = {
            botAccessToken: Encryption.encryptWithSalt(tokens.botAccessToken),
            botRefreshToken: Encryption.encryptWithSalt(tokens.botRefreshToken),
            channelAccessToken: Encryption.encryptWithSalt(tokens.channelAccessToken),
            channelRefreshToken: Encryption.encryptWithSalt(tokens.channelRefreshToken)
        };

        await db.collection("twitch").findOneAndUpdate({}, {$set: {
            "botAccessToken.salt": new MongoDb.Binary(encryptedTokens.botAccessToken.salt),
            "botAccessToken.encrypted": new MongoDb.Binary(encryptedTokens.botAccessToken.encrypted),
            "botRefreshToken.salt": new MongoDb.Binary(encryptedTokens.botRefreshToken.salt),
            "botRefreshToken.encrypted": new MongoDb.Binary(encryptedTokens.botRefreshToken.encrypted),
            "channelAccessToken.salt": new MongoDb.Binary(encryptedTokens.channelAccessToken.salt),
            "channelAccessToken.encrypted": new MongoDb.Binary(encryptedTokens.channelAccessToken.encrypted),
            "channelRefreshToken.salt": new MongoDb.Binary(encryptedTokens.channelRefreshToken.salt),
            "channelRefreshToken.encrypted": new MongoDb.Binary(encryptedTokens.channelRefreshToken.encrypted)
        }}, {upsert: true});
    }
}

module.exports = TwitchDb;
