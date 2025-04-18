/**
 * @typedef {import("@twurple/eventsub-http").EventSubMiddleware} EventSubMiddleware
 */

// MARK: class EventSub
/**
 * A class that handles Twitch EventSub.
 */
class EventSub {
    // MARK: static async setup
    /**
     * Performs setup of Twitch EventSub.
     * @param {EventSubMiddleware} eventSub The event sub middleware.
     * @returns {Promise<void>}
     */
    static async setup(eventSub) {
        this.client = eventSub;

        await this.client.markAsReady();
    }
}

module.exports = EventSub;
