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
        return time.toLocaleString("en-CA", {timeZone: timezone, hour12: false}).replace(/, /, "T");
    }
}

module.exports = Time;
