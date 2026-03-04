const AttendeeDb = require("../database/attendee"),
    Event = require("./event"),
    Exception = require("../errors/exception");

// MARK: class Attendee
/**
 * A class that represents an attendee of an event.
 */
class Attendee {
    // MARK: static async add
    /**
     * Adds an attendee to an event.
     * @param {number} eventId The event ID.
     * @param {number} userId The user ID.
     * @returns {Promise<boolean>} A promise that resolves with whether the user was added.
     */
    static async add(eventId, userId) {
        const event = Event.get(eventId);

        if (!event) {
            return false;
        }

        try {
            await AttendeeDb.add({eventId, userId});
        } catch (err) {
            throw new Exception("There was an error while adding an attendee to the database.", err);
        }

        return true;
    }

    // MARK: static async remove
    /**
     * Removes an attendee from an event.
     * @param {number} eventId The event ID.
     * @param {number} userId The user ID.
     * @returns {Promise<boolean>} A promise that resolves with whether the user was removed.
     */
    static async remove(eventId, userId) {
        const event = Event.get(eventId);

        if (!event) {
            return false;
        }

        try {
            await AttendeeDb.remove({eventId, userId});
        } catch (err) {
            throw new Exception("There was an error while removing an attendee from the database.", err);
        }

        return true;
    }
}

module.exports = Attendee;
