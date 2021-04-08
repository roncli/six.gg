//   ###                                      #####                              #   #    #
//  #   #                                     #                                  #   #
//  #       ###   # ##   #   #   ###   # ##   #      # ##   # ##    ###   # ##   #   #   ##     ###   #   #
//   ###   #   #  ##  #  #   #  #   #  ##  #  ####   ##  #  ##  #  #   #  ##  #   # #     #    #   #  #   #
//      #  #####  #       # #   #####  #      #      #      #      #   #  #       # #     #    #####  # # #
//  #   #  #      #       # #   #      #      #      #      #      #   #  #       # #     #    #      # # #
//   ###    ###   #        #     ###   #      #####  #      #       ###   #        #     ###    ###    # #
/**
 * A class that represents the 500 view.
 */
class ServerErrorView {
    //              #
    //              #
    //  ###   ##   ###
    // #  #  # ##   #
    //  ##   ##     #
    // #      ##     ##
    //  ###
    /**
     * Gets the rendered server error template.
     * @returns {string} An HTML string of the server error view.
     */
    static get() {
        return /* html */`
            <div id="error">
                <div class="section">500 - Messy and <i>ineffective</i>...</div>
                <div class="text">Something broke.  The error that caused this has been logged.  Please try your request again later.</div>
            </div>
        `;
    }
}

if (typeof module === "undefined") {
    window.ServerErrorView = ServerErrorView;
} else {
    module.exports = ServerErrorView; // eslint-disable-line no-undef
}
