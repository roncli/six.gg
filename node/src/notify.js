const Event = require("./models/event");

let setup = false;

// MARK: class Notify
/**
 * A class that handles Discord notifications.
 */
class Notify {
    // MARK: static setupNotifications
    /**
     * Setup notifications.
     * @returns {void}
     */
    static setupNotifications() {
        if (setup) {
            return;
        }

        Event.notify();

        setup = true;
    }
}

module.exports = Notify;
