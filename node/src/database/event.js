/**
 * @typedef {import("../../types/node/eventTypes").EventData} EventTypes.EventData
 * @typedef {import("../../types/node/eventTypes").EventMongoData} EventTypes.EventMongoData
 */

const MongoDb = require("mongodb"),

    Db = require(".");

//  #####                        #     ####   #
//  #                            #      #  #  #
//  #      #   #   ###   # ##   ####    #  #  # ##
//  ####   #   #  #   #  ##  #   #      #  #  ##  #
//  #       # #   #####  #   #   #      #  #  #   #
//  #       # #   #      #   #   #  #   #  #  ##  #
//  #####    #     ###   #   #    ##   ####   # ##
/**
 * A class to handle database calls to the event collection.
 */
class EventDb {
    //          #     #
    //          #     #
    //  ###   ###   ###
    // #  #  #  #  #  #
    // # ##  #  #  #  #
    //  # #   ###   ###
    /**
     * Add an event.
     * @param {EventTypes.EventData} data The event data.
     * @returns {Promise<EventTypes.EventData>} A promise that returns the event data has been added.
     */
    static async add(data) {
        const db = await Db.get();

        const event = {
            _id: MongoDb.Long.ZERO,
            title: data.title,
            start: data.start,
            end: data.end,
            userId: MongoDb.Long.fromNumber(data.userId),
            game: data.game
        };

        await Db.id(event, "event");

        if (data.gameId) {
            event.gameId = MongoDb.Long.fromNumber(data.gameId);
        }

        if (data.description) {
            event.description = data.description;
        }

        const result = await db.collection("event").insertOne(event);

        data._id = result.insertedId.toNumber();

        return data;
    }

    //              #
    //              #
    //  ###   ##   ###
    // #  #  # ##   #
    //  ##   ##     #
    // #      ##     ##
    //  ###
    /**
     * Gets an event by its event ID.
     * @param {number} id The event ID.
     * @returns {Promise<EventTypes.EventData>} A promise that returns the event.
     */
    static async get(id) {
        const db = await Db.get();

        const event = await db.collection("event").findOne({_id: MongoDb.Long.fromNumber(id)});

        if (!event) {
            return void 0;
        }

        return {
            _id: Db.fromLong(event._id),
            title: event.title,
            start: event.start,
            end: event.end,
            userId: Db.fromLong(event.userId),
            game: event.game,
            gameId: event.gameId ? Db.fromLong(event.gameId) : void 0,
            description: event.description
        };
    }

    //              #    ###         ###          #          ###
    //              #    #  #        #  #         #          #  #
    //  ###   ##   ###   ###   #  #  #  #   ###  ###    ##   #  #   ###  ###    ###   ##
    // #  #  # ##   #    #  #  #  #  #  #  #  #   #    # ##  ###   #  #  #  #  #  #  # ##
    //  ##   ##     #    #  #   # #  #  #  # ##   #    ##    # #   # ##  #  #   ##   ##
    // #      ##     ##  ###     #   ###    # #    ##   ##   #  #   # #  #  #  #      ##
    //  ###                     #                                               ###
    /**
     * Get events by date.
     * @param {Date} start The start date.
     * @param {Date} [end] The end date.
     * @returns {Promise<EventTypes.EventData[]>} A promise that returns the matching events.
     */
    static async getByDateRange(start, end) {
        const db = await Db.get(),
            range = {end: {$gte: start}};

        if (end) {
            range.start = {$lte: end};
        }

        const events = await db.collection("event").find({
            $and: [
                {
                    start: {$lte: end},
                    end: {$gte: start}
                }
            ]
        }).toArray();

        return events.map((e) => ({
            _id: Db.fromLong(e._id),
            title: e.title,
            start: e.start,
            end: e.end,
            userId: Db.fromLong(e.userId),
            game: e.game,
            gameId: e.gameId ? Db.fromLong(e.gameId) : void 0,
            description: e.description
        }));
    }

    // ###    ##   # #    ##   # #    ##
    // #  #  # ##  ####  #  #  # #   # ##
    // #     ##    #  #  #  #  # #   ##
    // #      ##   #  #   ##    #     ##
    /**
     * Removes an event.
     * @param {number} id The event ID.
     * @returns {Promise} A promise that resolves when the event has been removed.
     */
    static async remove(id) {
        const db = await Db.get();

        await Promise.all([
            db.collection("event").deleteOne({_id: MongoDb.Long.fromNumber(id)}),
            db.collection("attendee").deleteMany({eventId: MongoDb.Long.fromNumber(id)})
        ]);
    }
}

module.exports = EventDb;
