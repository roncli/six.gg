/**
 * @typedef {import("../../types/node/attendeeTypes").AttendeeData} AttendeeTypes.AttendeeData
 * @typedef {import("../../types/node/attendeeTypes").AttendeeMongoData} AttendeeTypes.AttendeeMongoData
 */

const MongoDb = require("mongodb"),

    Db = require(".");

//    #     #      #                       #                ####   #
//   # #    #      #                       #                 #  #  #
//  #   #  ####   ####    ###   # ##    ## #   ###    ###    #  #  # ##
//  #   #   #      #     #   #  ##  #  #  ##  #   #  #   #   #  #  ##  #
//  #####   #      #     #####  #   #  #   #  #####  #####   #  #  #   #
//  #   #   #  #   #  #  #      #   #  #  ##  #      #       #  #  ##  #
//  #   #    ##     ##    ###   #   #   ## #   ###    ###   ####   # ##
/**
 * A class to handle database calls to the attendee collection.
 */
class AttendeeDb {
    //          #     #
    //          #     #
    //  ###   ###   ###
    // #  #  #  #  #  #
    // # ##  #  #  #  #
    //  # #   ###   ###
    /**
     * Adds an attendee to an event.
     * @param {AttendeeTypes.AttendeeData} data The data to add.
     * @returns {Promise<AttendeeTypes.AttendeeData>} A promise that returns the data, including the newly inserted ID.
     */
    static async add(data) {
        const db = await Db.get();

        /** @type {MongoDb.InsertOneWriteOpResult<AttendeeTypes.AttendeeMongoData>} */
        const result = await db.collection("attendee").insertOne({
            eventId: MongoDb.Long.fromNumber(data.eventId),
            userId: MongoDb.Long.fromNumber(data.userId)
        });

        data._id = result.ops[0]._id.toHexString();

        return data;
    }

    // ###    ##   # #    ##   # #    ##
    // #  #  # ##  ####  #  #  # #   # ##
    // #     ##    #  #  #  #  # #   ##
    // #      ##   #  #   ##    #     ##
    /**
     * Removes an attendee from an event.
     * @param {AttendeeTypes.AttendeeData} data The data to remove.
     * @returns {Promise} A promise that resolves when the attendee has been removed from an event.
     */
    static async remove(data) {
        const db = await Db.get();

        await db.collection("attendee").deleteOne(data);
    }
}

module.exports = AttendeeDb;
