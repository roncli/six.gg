const MongoDb = require("mongodb");

/**
 * @type {MongoDb.MongoClient}
 */
let client;

/**
 * @type {MongoDb.Db}
 */
let db;

//  ####   #
//   #  #  #
//   #  #  # ##
//   #  #  ##  #
//   #  #  #   #
//   #  #  ##  #
//  ####   # ##
/**
 * A class that handles setting up the database.
 */
class Db {
    //   #                     #
    //  # #                    #
    //  #    ###    ##   # #   #      ##   ###    ###
    // ###   #  #  #  #  ####  #     #  #  #  #  #  #
    //  #    #     #  #  #  #  #     #  #  #  #   ##
    //  #    #      ##   #  #  ####   ##   #  #  #
    //                                            ###
    /**
     * Converts a value from a MongoDb.Long to a number.
     * @param {MongoDb.Long|number} val The number.
     * @returns {number} The number.
     */
    static fromLong(val) {
        return typeof val === "number" ? val : val.toNumber();
    }

    //    #  #
    //    #  #
    //  ###  ###
    // #  #  #  #
    // #  #  #  #
    //  ###  ###
    /**
     * Gets the database object.
     * @returns {MongoDb.Db} The database.
     */
    get db() {
        return db;
    }

    //               #
    //               #
    //  ###    ##   ###   #  #  ###
    // ##     # ##   #    #  #  #  #
    //   ##   ##     #    #  #  #  #
    // ###     ##     ##   ###  ###
    //                          #
    /**
     * Sets up the database.
     * @returns {Promise} A promise that resolves with the database.
     */
    async setup() {
        if (!client) {
            client = new MongoDb.MongoClient(`mongodb://web_sixgg:${process.env.WEB_SIXGG_PASSWORD}@db:27017/sixgg`, {
                authMechanism: "SCRAM-SHA-256",
                authSource: "admin",
                useUnifiedTopology: true,
                promoteLongs: false
            });
        }

        if (!client.isConnected()) {
            await client.connect();
        }

        if (!db) {
            db = client.db("sixgg");
        }
    }

    //  #       #
    //          #
    // ##     ###
    //  #    #  #
    //  #    #  #
    // ###    ###
    /**
     * Appends an ID to an object.
     * @param {object} object The object to append the ID to.
     * @param {string} collection The collection the ID belongs to.
     * @returns {Promise} A promise that resolves when the ID has been appended.
     */
    async id(object, collection) {
        await this.setup();

        object._id = MongoDb.Long.fromNumber((await db.collection("counters").findOneAndUpdate({_id: collection}, {$inc: {value: MongoDb.Long.fromNumber(1)}})).value.value + 1);
    }
}

module.exports = Db;
