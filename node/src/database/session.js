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
class SessionDb extends Db {
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
    async update(session) {
        await super.setup();

        const encryption = new Encryption();

        const encryptedTokens = {
            accessToken: encryption.encryptWithSalt(session.accessToken),
            refreshToken: encryption.encryptWithSalt(session.refreshToken)
        };

        await super.db.collection("session").findOneAndUpdate({_id: session._id, ip: session.ip, userId: MongoDb.Long.fromNumber(session.userId)}, {$set: {
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
