// MARK: class TwitchRefreshView
/**
 * A class that represents the Twitch refresh view.
 */
class TwitchRefreshView {
    // MARK: static get
    /**
     * Gets the rendered page template.
     * @param {string} clientId The client ID.
     * @param {string} redirectUri The redirect URI.
     * @param {string} channelScopes The channel scopes.
     * @param {string} botScopes The bot scopes.
     * @param {string} state The state to use when logging into Twitch.
     * @returns {string} An HTML string of the page.
     */
    static get(clientId, redirectUri, channelScopes, botScopes, state) {
        return /* html */`
            <div class="section">Refresh Twitch Tokens</div>
            <div>
                Make sure you are currently logged into the account on twitch.tv you are trying to refresh the token for.
            </div>
            <div>
                <a href="https://id.twitch.tv/oauth2/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${channelScopes}&state=${state}">Refresh token for SixGamingGG</a>
            </div>
            <div>
                <a href="https://id.twitch.tv/oauth2/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${botScopes}&state=${state}">Refresh token for SixBotGG</a>
            </div>
        `;
    }
}

if (typeof module === "undefined") {
    window.TwitchRefreshView = TwitchRefreshView;
} else {
    module.exports = TwitchRefreshView; // eslint-disable-line no-undef
}
