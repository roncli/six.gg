/**
 * @typedef {import("../../types/browser/viewTypes").HomeViewParameters} ViewTypes.HomeViewParameters
 */

// MARK: class HomeView
/**
 * A class that represents the home view.
 */
class HomeView {
    static #StreamersView = typeof module === "undefined" ? window.StreamersView : require("./home/streamers");

    static #quoteReplaceParse = /"/gm;

    // MARK: static get
    /**
     * Gets the rendered page template.
     * @param {ViewTypes.HomeViewParameters} data The page data.
     * @returns {string} An HTML string of the page.
     */
    static get(data) {
        const {streamers, timezone, defaultTimezone} = data;
        const fixedTimezone = timezone.replace(HomeView.#quoteReplaceParse, "\\\"");

        return /* html */`
            <div class="section">Upcoming Events</div>
            ${defaultTimezone ? /* html */`
                <div class="subsection">All times are in US Pacific time.</div>
            ` : ""}
            <div id="calendar"></div>
            <div id="streamers">
                ${streamers && streamers.length > 0 ? HomeView.#StreamersView.get(streamers) : ""}
            </div>
            <script>
                window.timezone = "${fixedTimezone}";
            </script>
        `;
    }
}

if (typeof module === "undefined") {
    window.HomeView = HomeView;
} else {
    module.exports = HomeView;
}
