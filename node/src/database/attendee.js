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
class AttendeeDb extends Db {
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
    async add(data) {
        await super.setup();

        /** @type {MongoDb.InsertOneWriteOpResult<AttendeeTypes.AttendeeMongoData>} */
        const result = await super.db.collection("attendee").insertOne({
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
    async remove(data) {
        await super.setup();

        await super.db.collection("attendee").deleteOne(data);
    }
}

module.exports = AttendeeDb;
