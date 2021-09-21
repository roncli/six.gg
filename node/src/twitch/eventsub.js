/**
 * @typedef {import("@twurple/eventsub").EventSubMiddleware} EventSubMiddleware
 */

//  #####                        #      ###          #
//  #                            #     #   #         #
//  #      #   #   ###   # ##   ####   #      #   #  # ##
//  ####   #   #  #   #  ##  #   #      ###   #   #  ##  #
//  #       # #   #####  #   #   #         #  #   #  #   #
//  #       # #   #      #   #   #  #  #   #  #  ##  ##  #
//  #####    #     ###   #   #    ##    ###    ## #  # ##
/**
 * A class that handles Twitch EventSub.
 */
class EventSub {
    //               #
    //               #
    //  ###    ##   ###   #  #  ###
    // ##     # ##   #    #  #  #  #
    //   ##   ##     #    #  #  #  #
    // ###     ##     ##   ###  ###
    //                          #
    /**
     * Performs setup of Twitch EventSub.
     * @param {EventSubMiddleware} eventSub The event sub middleware.
     * @returns {Promise} A promise that resolves when the EventSub are setup.
     */
    static async setup(eventSub) {
        this.client = eventSub;

        await this.client.markAsReady();
    }
}

module.exports = EventSub;
