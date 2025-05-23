// MARK: class Time
/**
 * A class that represents time functions.
 */
class Time {
    // MARK: static getLocalIsoTime
    /**
     * Gets the local ISO time for a timezone.
     * @param {Date} time The time.
     * @param {string} timezone The timezone.
     * @returns {string} The local ISO time.
     */
    static getLocalIsoTime(time, timezone) {
        // The following will work on node 15+.
        // return time.toLocaleString("en-CA", {timeZone: timezone, hour12: false}).replace(/, /, "T");

        const local = time.toLocaleString("en-US", {timeZone: timezone, hour12: false, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit"});

        return `${local.substring(6, 10)}-${local.substring(0, 2)}-${local.substring(3, 5)}T${local.substring(12, 20)}`;
    }
}

module.exports = Time;
