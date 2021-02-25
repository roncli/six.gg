/**
 * @typedef {import("../../types/node/eventTypes").EventData} EventTypes.EventData
 */

const EventDb = require("../database/event"),
    Exception = require("../errors/exception");

//  #####                        #
//  #                            #
//  #      #   #   ###   # ##   ####
//  ####   #   #  #   #  ##  #   #
//  #       # #   #####  #   #   #
//  #       # #   #      #   #   #  #
//  #####    #     ###   #   #    ##
/**
 * A class that represents a calendar event.
 */
class Event {
    //          #     #
    //          #     #
    //  ###   ###   ###
    // #  #  #  #  #  #
    // # ##  #  #  #  #
    //  # #   ###   ###
    /**
     * Adds an event.
     * @param {EventTypes.EventData} data The event data.
     * @returns {Promise<Event>} A promise that returns the created event.
     */
    static async add(data) {
        try {
            await EventDb.add(data);
        } catch (err) {
            throw new Exception("There was an error while adding an event to the database.", err);
        }

        return new Event(data);
    }

    //              #
    //              #
    //  ###   ##   ###
    // #  #  # ##   #
    //  ##   ##     #
    // #      ##     ##
    //  ###
    /**
     * Gets an event by ID.
     * @param {number} id The event ID.
     * @returns {Promise<Event>} A promise that returns the event.
     */
    static async get(id) {
        /** @type {EventTypes.EventData} */
        let event;
        try {
            event = await EventDb.get(id);
        } catch (err) {
            throw new Exception("There was an error while getting an event from the database.", err);
        }

        if (!event) {
            return void 0;
        }

        return new Event(event);
    }

    //              #    ###         ###          #          ###
    //              #    #  #        #  #         #          #  #
    //  ###   ##   ###   ###   #  #  #  #   ###  ###    ##   #  #   ###  ###    ###   ##
    // #  #  # ##   #    #  #  #  #  #  #  #  #   #    # ##  ###   #  #  #  #  #  #  # ##
    //  ##   ##     #    #  #   # #  #  #  # ##   #    ##    # #   # ##  #  #   ##   ##
    // #      ##     ##  ###     #   ###    # #    ##   ##   #  #   # #  #  #  #      ##
    //  ###                     #                                               ###
    /**
     * Gets events by a date range.
     * @param {Date} start The start date.
     * @param {Date} end The end date.
     * @returns {Promise<Event[]>} A promise that returns the events.
     */
    static async getByDateRange(start, end) {
        /** @type {EventTypes.EventData[]} */
        let events;
        try {
            events = await EventDb.getByDateRange(start, end);
        } catch (err) {
            throw new Exception("There was an error while getting events from the database.", err);
        }

        if (!events) {
            return void 0;
        }

        return events && events.map((e) => new Event(e)) || [];
    }

    // ###    ##   # #    ##   # #    ##
    // #  #  # ##  ####  #  #  # #   # ##
    // #     ##    #  #  #  #  # #   ##
    // #      ##   #  #   ##    #     ##
    /**
     * Removes an event from the database.
     * @param {number} eventId The event ID.
     * @param {number} userId The user ID.
     * @returns {Promise<boolean>} A promise that returns whether the event has been removed.
     */
    static async remove(eventId, userId) {
        let event;
        try {
            event = await EventDb.get(eventId);
        } catch (err) {
            throw new Exception("There was an error getting an event while attempting to delete it from the database.", err);
        }

        if (!event || event.userId !== userId) {
            return false;
        }

        try {
            await EventDb.remove(eventId);
        } catch (err) {
            throw new Exception("There was an error getting an event while attempting to delete it from the database.", err);
        }

        return true;
    }

    //                           #                       #
    //                           #                       #
    //  ##    ##   ###    ###   ###   ###   #  #   ##   ###    ##   ###
    // #     #  #  #  #  ##      #    #  #  #  #  #      #    #  #  #  #
    // #     #  #  #  #    ##    #    #     #  #  #      #    #  #  #
    //  ##    ##   #  #  ###      ##  #      ###   ##     ##   ##   #
    /**
     * Creates a new event.
     * @param {EventTypes.EventData} event The event.
     */
    constructor(event) {
        this.id = event._id;
        this.title = event.title;
        this.start = event.start;
        this.end = event.end;
        this.userId = event.userId;
        this.game = event.game;
        this.gameId = event.gameId;
        this.description = event.description;
    }
}

module.exports = Event;
