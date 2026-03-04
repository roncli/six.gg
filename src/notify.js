const Event = require("./models/event");

// MARK: class Notify
/**
 * A class that handles Discord notifications.
 */
class Notify {
    static #setup = false;

    // MARK: static setupNotifications
    /**
     * Setup notifications.
     * @returns {void}
     */
    static setupNotifications() {
        if (Notify.#setup) {
            return;
        }

        Event.notify();

        Notify.#setup = true;
    }
}

module.exports = Notify;
