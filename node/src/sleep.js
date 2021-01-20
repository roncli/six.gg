//   ###    ##
//  #   #    #
//  #        #     ###    ###   # ##
//   ###     #    #   #  #   #  ##  #
//      #    #    #####  #####  ##  #
//  #   #    #    #      #      # ##
//   ###    ###    ###    ###   #
//                              #
//                              #
/**
 * A class that allows a thread to sleep through promises and the setTimeout function.
 */
class Sleep {
    //        ##
    //         #
    //  ###    #     ##    ##   ###
    // ##      #    # ##  # ##  #  #
    //   ##    #    ##    ##    #  #
    // ###    ###    ##    ##   ###
    //                          #
    /**
     * Sleeps the thread for the specified time.
     * @param {number} ms The number of milliseconds to sleep for.
     * @returns {Promise} A promise that resolves when the sleep period has completed.
     */
    sleep(ms) {
        return new Promise((resolve) => {
            setTimeout(resolve, ms);
        });
    }
}

module.exports = Sleep;
