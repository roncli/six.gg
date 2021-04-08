//  #   #          #     #####                           #  #   #    #
//  #   #          #     #                               #  #   #
//  ##  #   ###   ####   #       ###   #   #  # ##    ## #  #   #   ##     ###   #   #
//  # # #  #   #   #     ####   #   #  #   #  ##  #  #  ##   # #     #    #   #  #   #
//  #  ##  #   #   #     #      #   #  #   #  #   #  #   #   # #     #    #####  # # #
//  #   #  #   #   #  #  #      #   #  #  ##  #   #  #  ##   # #     #    #      # # #
//  #   #   ###     ##   #       ###    ## #  #   #   ## #    #     ###    ###    # #
/**
 * A class that represents the 404 view.
 */
class NotFoundView {
    //              #
    //              #
    //  ###   ##   ###
    // #  #  # ##   #
    //  ##   ##     #
    // #      ##     ##
    //  ###
    /**
     * Gets the rendered not found template.
     * @param {{message: string}} data The data for the not found view.
     * @returns {string} An HTML string of the not found view.
     */
    static get(data) {
        const {message} = data;

        return /* html */`
            <div id="error">
                <div class="section">404 - Filling in for your web page as <i>always</i>...</div>
                <div>${message}</div>
            </div>
        `;
    }
}

if (typeof module === "undefined") {
    window.NotFoundView = NotFoundView;
} else {
    module.exports = NotFoundView; // eslint-disable-line no-undef
}
