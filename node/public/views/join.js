//    ###           #           #   #    #
//      #                       #   #
//      #   ###    ##    # ##   #   #   ##     ###   #   #
//      #  #   #    #    ##  #   # #     #    #   #  #   #
//      #  #   #    #    #   #   # #     #    #####  # # #
//  #   #  #   #    #    #   #   # #     #    #      # # #
//   ###    ###    ###   #   #    #     ###    ###    # #
/**
 * A class that represents the join view.
 */
class JoinView {
    //              #
    //              #
    //  ###   ##   ###
    // #  #  # ##   #
    //  ##   ##     #
    // #      ##     ##
    //  ###
    /**
     * Gets the rendered page template.
     * @returns {string} An HTML string of the page.
     */
    static get() {
        return /* html */`
            <div class="section">Join Six Gaming</div>
            <div>To log in to Six Gaming, you must first join the Six Gaming server on Discord.  Visit the link below to join the Six Gaming Discord and then log in using the link in the upper right corner of the page.</div>
        `;
    }
}

if (typeof module !== "undefined") {
    module.exports = JoinView; // eslint-disable-line no-undef
}
