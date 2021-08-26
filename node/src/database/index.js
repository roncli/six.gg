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

    //  #          #
    //  #          #
    // ###    ##   #      ##   ###    ###
    //  #    #  #  #     #  #  #  #  #  #
    //  #    #  #  #     #  #  #  #   ##
    //   ##   ##   ####   ##   #  #  #
    //                                ###
    /**
     * Converts a value from a number to a MongoDb.Long.
     * @param {MongoDb.Long|number} val The number.
     * @returns {MongoDb.Long} The number.
     */
    static toLong(val) {
        return typeof val === "number" ? MongoDb.Long.fromNumber(val) : val;
    }

    //              #
    //              #
    //  ###   ##   ###
    // #  #  # ##   #
    //  ##   ##     #
    // #      ##     ##
    //  ###
    /**
     * Gets the database object.
     * @returns {Promise<MongoDb.Db>} The database.
     */
    static async get() {
        if (!client) {
            client = new MongoDb.MongoClient(`mongodb://web_sixgg:${process.env.WEB_SIXGG_PASSWORD}@db:27017/sixgg`, {
                authMechanism: "SCRAM-SHA-256",
                authSource: "admin",
                promoteLongs: false
            });
        }

        await client.connect();

        if (!db) {
            db = client.db("sixgg");
        }

        return db;
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
    static async id(object, collection) {
        if (!db) {
            await Db.get();
        }

        object._id = (await db.collection("counters").findOneAndUpdate({_id: collection}, {$inc: {value: MongoDb.Long.fromNumber(1)}})).value.value.add(1);
    }
}

module.exports = Db;
