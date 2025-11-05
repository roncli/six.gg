/**
 * @typedef {import("../../types/browser/viewTypes").CalendarViewParameters} ViewTypes.CalendarViewParameters
 */

// MARK: class CalendarView
/**
 * A class that represents the calendar view.
 */
class CalendarView {
    static #quoteReplaceParse = /"/gm;

    // MARK: static get
    /**
     * Gets the rendered page template.
     * @param {ViewTypes.CalendarViewParameters} data The page data.
     * @returns {string} An HTML string of the page.
     */
    static get(data) {
        const {timezone, defaultTimezone} = data;
        const fixedTimezone = timezone.replace(CalendarView.#quoteReplaceParse, "\\\"");

        return /* html */`
            <div class="section">Six Gaming Calendar of Events</div>
            ${defaultTimezone ? /* html */`
                <div class="subsection">All times are in US Pacific time.</div>
            ` : ""}
            <div id="calendar"></div>
            <script>
                document.addEventListener("DOMContentLoaded", () => {
                    Calendar.DOMContentLoaded("${fixedTimezone}", ${defaultTimezone});
                });
            </script>
        `;
    }
}

if (typeof module === "undefined") {
    window.CalendarView = CalendarView;
} else {
    module.exports = CalendarView;
}
