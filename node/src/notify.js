const Event = require("./models/event");

let setup = false;

//  #   #          #       #      ##
//  #   #          #             #  #
//  ##  #   ###   ####    ##     #     #   #
//  # # #  #   #   #       #    ####   #   #
//  #  ##  #   #   #       #     #     #  ##
//  #   #  #   #   #  #    #     #      ## #
//  #   #   ###     ##    ###    #         #
//                                     #   #
//                                      ###
/**
 * A class that handles Discord notifications.
 */
class Notify {
    //               #                #  #         #     #      #    #                 #     #
    //               #                ## #         #           # #                     #
    //  ###    ##   ###   #  #  ###   ## #   ##   ###   ##     #    ##     ##    ###  ###   ##     ##   ###    ###
    // ##     # ##   #    #  #  #  #  # ##  #  #   #     #    ###    #    #     #  #   #     #    #  #  #  #  ##
    //   ##   ##     #    #  #  #  #  # ##  #  #   #     #     #     #    #     # ##   #     #    #  #  #  #    ##
    // ###     ##     ##   ###  ###   #  #   ##     ##  ###    #    ###    ##    # #    ##  ###    ##   #  #  ###
    //                          #
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
