/**
 * @typedef {import("../../types/node/sessionTypes").SessionData} SessionTypes.SessionData
 */

const Db = require("."),
    Encryption = require("./encryption"),
    MongoDb = require("mongodb");

// MARK: class SessionDb
/**
 * A class to handle database calls to the session collection.
 */
class SessionDb {
    // MARK: static async delete
    /**
     * Deletes a sessino by its ID.
     * @param {string} id The session ID.
     * @returns {Promise} A promise that resolves when the session has been deleted.
     */
    static async delete(id) {
        const db = await Db.get();

        await db.collection("session").deleteOne({_id: MongoDb.ObjectId.createFromHexString(id)});
    }

    // MARK: static async update
    /**
     * Updates the session.
     * @param {SessionTypes.SessionData} session The session to update.
     * @returns {Promise} A promise that resolves when the session has been updated.
     */
    static async update(session) {
        const db = await Db.get();

        const encryptedTokens = {
            accessToken: Encryption.encryptWithSalt(session.accessToken),
            refreshToken: Encryption.encryptWithSalt(session.refreshToken)
        };

        await db.collection("session").findOneAndUpdate({_id: MongoDb.ObjectId.createFromHexString(session._id), ip: session.ip, userId: MongoDb.Long.fromNumber(session.userId)}, {$set: {
            ip: session.ip,
            userId: MongoDb.Long.fromNumber(session.userId),
            "accessToken.salt": new MongoDb.Binary(encryptedTokens.accessToken.salt),
            "accessToken.encrypted": new MongoDb.Binary(encryptedTokens.accessToken.encrypted),
            "refreshToken.salt": new MongoDb.Binary(encryptedTokens.refreshToken.salt),
            "refreshToken.encrypted": new MongoDb.Binary(encryptedTokens.refreshToken.encrypted),
            expires: session.expires
        }});
    }
}

module.exports = SessionDb;
