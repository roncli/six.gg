//  #####    #
//    #
//    #     ##    ## #    ###
//    #      #    # # #  #   #
//    #      #    # # #  #####
//    #      #    # # #  #
//    #     ###   #   #   ###
/**
 * A class that represents time functions.
 */
class Time {
    //              #    #                       ##    ###                ###    #
    //              #    #                        #     #                  #
    //  ###   ##   ###   #      ##    ##    ###   #     #     ###    ##    #    ##    # #    ##
    // #  #  # ##   #    #     #  #  #     #  #   #     #    ##     #  #   #     #    ####  # ##
    //  ##   ##     #    #     #  #  #     # ##   #     #      ##   #  #   #     #    #  #  ##
    // #      ##     ##  ####   ##    ##    # #  ###   ###   ###     ##    #    ###   #  #   ##
    //  ###
    /**
     * Gets the local ISO time for a timezone.
     * @param {Date} time The time.
     * @param {string} timezone The timezone.
     * @returns {string} The local ISO time.
     */
    getLocalIsoTime(time, timezone) {
        // The following will work on node 15+.
        // return time.toLocaleString("en-CA", {timeZone: timezone, hour12: false}).replace(/, /, "T");

        const local = time.toLocaleString("en-US", {timeZone: timezone, hour12: false, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit"});

        return `${local.substr(6, 4)}-${local.substr(0, 2)}-${local.substr(3, 2)}T${local.substr(12, 8)}`;
    }
}

module.exports = Time;
