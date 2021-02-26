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

        /** @type {MongoDb.FindAndModifyWriteOpResultObject<AttendeeTypes.AttendeeMongoData>} */
        const result = await db.collection("attendee").findOneAndUpdate({
            eventId: MongoDb.Long.fromNumber(data.eventId),
            userId: MongoDb.Long.fromNumber(data.userId)
        }, {$set: {
            eventId: MongoDb.Long.fromNumber(data.eventId),
            userId: MongoDb.Long.fromNumber(data.userId)
        }}, {upsert: true, returnOriginal: false});

        data._id = result.value._id.toHexString();

        return data;
    }

    //              #    ###         ####                     #    ###      #
    //              #    #  #        #                        #     #       #
    //  ###   ##   ###   ###   #  #  ###   # #    ##   ###   ###    #     ###
    // #  #  # ##   #    #  #  #  #  #     # #   # ##  #  #   #     #    #  #
    //  ##   ##     #    #  #   # #  #     # #   ##    #  #   #     #    #  #
    // #      ##     ##  ###     #   ####   #     ##   #  #    ##  ###    ###
    //  ###                     #
    /**
     * Gets attendees by the event ID.
     * @param {number} id The event ID.
     * @returns {Promise<{discordId: string}[]>} A promise that returns the users attending the event.
     */
    static async getByEventId(id) {
        const db = await Db.get();

        return db.collection("attendee").aggregate([
            {
                $match: {eventId: Db.toLong(id)}
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
                    user: "$user"
                }
            },
            {
                $unwind: "$user"
            },
            {
                $project: {
                    discordId: "$user.discord.id"
                }
            }
        ]).toArray();
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
