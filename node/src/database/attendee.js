/**
 * @typedef {import("../../types/node/attendeeTypes").AttendeeData} AttendeeTypes.AttendeeData
 * @typedef {import("../../types/node/attendeeTypes").AttendeeMongoData} AttendeeTypes.AttendeeMongoData
 */

const Cache = require("@roncli/node-redis").Cache,
    Db = require("."),
    MongoDb = require("mongodb");

// MARK: class AttendeeDb
/**
 * A class to handle database calls to the attendee collection.
 */
class AttendeeDb {
    // MARK: static async add
    /**
     * Adds an attendee to an event.
     * @param {AttendeeTypes.AttendeeData} data The data to add.
     * @returns {Promise<AttendeeTypes.AttendeeData>} A promise that returns the data, including the newly inserted ID.
     */
    static async add(data) {
        const db = await Db.get();

        const result = await db.collection("attendee").findOneAndUpdate({
            eventId: MongoDb.Long.fromNumber(data.eventId),
            userId: MongoDb.Long.fromNumber(data.userId)
        }, {$set: {
            eventId: MongoDb.Long.fromNumber(data.eventId),
            userId: MongoDb.Long.fromNumber(data.userId)
        }}, {upsert: true, returnDocument: "after"});

        data._id = result._id.toHexString();

        await Cache.invalidate([`${process.env.REDIS_PREFIX}:invalidate:event:${data.eventId}:attendees:updated`]);

        return data;
    }

    // MARK: static async getByEventId
    /**
     * Gets attendees by the event ID.
     * @param {number} id The event ID.
     * @returns {Promise<{discordId: string}[]>} A promise that returns the users attending the event.
     */
    static async getByEventId(id) {
        const key = `${process.env.REDIS_PREFIX}:db:attendee:getByEventId:${id}`;

        /** @type {{discordId: string}[]} */
        let cache = await Cache.get(key);

        if (cache) {
            return cache;
        }

        const db = await Db.get();

        cache = await /** @type {Promise<{discordId: string}[]>} */(db.collection("attendee").aggregate([ // eslint-disable-line @stylistic/no-extra-parens
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
        ]).toArray());

        await Cache.add(key, cache, new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000), [`${process.env.REDIS_PREFIX}:invalidate:event:${id}:attendees:updated`]);

        return cache;
    }

    // MARK: static async remove
    /**
     * Removes an attendee from an event.
     * @param {AttendeeTypes.AttendeeData} attendee The data to remove.
     * @returns {Promise<void>}
     */
    static async remove(attendee) {
        const db = await Db.get();

        const data = {
            eventId: Db.toLong(attendee.eventId),
            userId: Db.toLong(attendee.userId)
        };

        await db.collection("attendee").deleteOne(data);

        await Cache.invalidate([`${process.env.REDIS_PREFIX}:invalidate:event:${Db.fromLong(data.eventId)}:attendees:updated`]);
    }
}

module.exports = AttendeeDb;
