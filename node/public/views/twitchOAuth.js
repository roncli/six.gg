// MARK: class TwitchOAuthView
/**
 * A class that represents the Twitch OAuth view.
 */
class TwitchOAuthView {
    // MARK: static get
    /**
     * Gets the rendered page template.
     * @returns {string} An HTML string of the page.
     */
    static get() {
        return /* html */`
            <div class="section">Twitch Tokens refreshed</div>
            <div>
                The Twitch tokens have been refreshed.
            </div>
        `;
    }
}

if (typeof module === "undefined") {
    window.TwitchOAuthView = TwitchOAuthView;
} else {
    module.exports = TwitchOAuthView; // eslint-disable-line no-undef
}
