/**
 * @typedef {import("../../types/node/sessionTypes").SessionData} SessionTypes.SessionData
 */

const MongoDb = require("mongodb"),

    Db = require("."),
    Encryption = require("./encryption");

//   ###                          #                  ####   #
//  #   #                                             #  #  #
//  #       ###    ###    ###    ##     ###   # ##    #  #  # ##
//   ###   #   #  #      #        #    #   #  ##  #   #  #  ##  #
//      #  #####   ###    ###     #    #   #  #   #   #  #  #   #
//  #   #  #          #      #    #    #   #  #   #   #  #  ##  #
//   ###    ###   ####   ####    ###    ###   #   #  ####   # ##
/**
 * A class to handle database calls to the session collection.
 */
class SessionDb {
    //                #         #
    //                #         #
    // #  #  ###    ###   ###  ###    ##
    // #  #  #  #  #  #  #  #   #    # ##
    // #  #  #  #  #  #  # ##   #    ##
    //  ###  ###    ###   # #    ##   ##
    //       #
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

        await db.collection("session").findOneAndUpdate({_id: session._id, ip: session.ip, userId: MongoDb.Long.fromNumber(session.userId)}, {$set: {
            ip: session.ip,
            userId: MongoDb.Long.fromNumber(session.userId),
            accessToken: {
                salt: new MongoDb.Binary(encryptedTokens.accessToken.salt),
                encrypted: new MongoDb.Binary(encryptedTokens.accessToken.encrypted)
            },
            refreshToken: {
                salt: new MongoDb.Binary(encryptedTokens.refreshToken.salt),
                encrypted: new MongoDb.Binary(encryptedTokens.refreshToken.encrypted)
            },
            expires: session.expires
        }});
    }
}

module.exports = SessionDb;
