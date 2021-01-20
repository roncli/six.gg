/**
 * @typedef {import("../../types/browser/viewTypes").HomeViewParameters} ViewTypes.HomeViewParameters
 */

//  #   #                       #   #    #
//  #   #                       #   #
//  #   #   ###   ## #    ###   #   #   ##     ###   #   #
//  #####  #   #  # # #  #   #   # #     #    #   #  #   #
//  #   #  #   #  # # #  #####   # #     #    #####  # # #
//  #   #  #   #  # # #  #       # #     #    #      # # #
//  #   #   ###   #   #   ###     #     ###    ###    # #
/**
 * A class that represents the home view.
 */
class HomeView {
    //              #
    //              #
    //  ###   ##   ###
    // #  #  # ##   #
    //  ##   ##     #
    // #      ##     ##
    //  ###
    /**
     * Gets the rendered page template.
     * @param {ViewTypes.HomeViewParameters} data The page data.
     * @returns {string} An HTML string of the page.
     */
    get(data) {
        const {streamers, timezone, defaultTimezone} = data;

        return /* html */`
            <div class="section">Upcoming Events</div>
            ${defaultTimezone ? /* html */`
                <div class="subsection">All times are in US Pacific time.</div>
            ` : ""}
            <div id="calendar"></div>
            <div id="streamers">
                ${streamers && streamers.length > 0 ? HomeView.streamersView.get(streamers) : ""}
            </div>
            <script>
                window.timezone = "${timezone.replace(/"/gm, "\\\"")}";
            </script>
        `;
    }
}

/** @type {import("./home/streamers")} */
// @ts-ignore
HomeView.streamersView = new (typeof StreamersView === "undefined" ? require("./home/streamers") : StreamersView)(); // eslint-disable-line no-undef

if (typeof module !== "undefined") {
    module.exports = HomeView; // eslint-disable-line no-undef
}
