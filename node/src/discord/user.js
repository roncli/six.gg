/**
 * @typedef {import("../../types/node/discordOAuthTypes").Connection} DiscordOAuthTypes.Connection
 * @typedef {import("../../types/node/discordOAuthTypes").TokenRequestResult} DiscordOAuthTypes.TokenRequestResult
 * @typedef {import("../../types/node/discordOAuthTypes").User} DiscordOAuthTypes.User
 */

const crypto = require("crypto"),
    DiscordOAuth = require("discord-oauth2"),
    Log = require("@roncli/node-application-insights-logger");

// MARK: class User
/**
 * A class that handles all Discord user interactions.
 */
class User {
    static #oauth = new DiscordOAuth({
        clientId: process.env.DISCORD_CLIENTID,
        clientSecret: process.env.DISCORD_CLIENTSECRET,
        redirectUri: process.env.DISCORD_REDIRECT_URI,
        credentials: Buffer.from(`${process.env.DISCORD_CLIENTID}:${process.env.DISCORD_CLIENT_SECRET}`).toString("base64")
    });

    static #validStates = new Set();

    // MARK: static getOAuthUrl
    /**
     * Gets the OAuth URL to use, generating a state to ensure that it came from this site.
     * @returns {string} The OAuth URL to use.
     */
    static getOAuthUrl() {
        let state;
        do {
            state = crypto.randomBytes(16).toString("hex");

            if (User.#validStates.has(state)) {
                state = void 0;
            }
        } while (!state);

        User.#validStates.add(state);

        setTimeout(() => {
            User.#validStates.delete(state);
        }, 300000);

        return User.#oauth.generateAuthUrl({
            scope: process.env.DISCORD_USERSCOPES,
            state
        });
    }

    // MARK: static async getToken
    /**
     * Gets a Discord token for a user from the state.
     * @param {string} state The state string.
     * @param {string} code The OAuth code.
     * @returns {Promise<DiscordOAuthTypes.TokenRequestResult>} A promise that returns the token.
     */
    static async getToken(state, code) {
        if (!User.#validStates.has(state)) {
            return void 0;
        }

        try {
            const token = await User.#oauth.tokenRequest({
                code,
                scope: process.env.DISCORD_USERSCOPES,
                grantType: "authorization_code"
            });

            User.#validStates.delete(state);

            return token;
        } catch (err) {
            if (err instanceof Error && err.message.indexOf("400 Bad Request") !== -1) {
                return void 0;
            }

            Log.error("There was a Discord OAuth exception while getting a token.", {err});
            throw new Error("Discord returned an error while getting a token.");
        }
    }

    // MARK: static async getUser
    /**
     * Gets the user for a token.
     * @param {string} token The access token.
     * @returns {Promise<DiscordOAuthTypes.User>} A promise that returns the user.
     */
    static async getUser(token) {
        try {
            return await User.#oauth.getUser(token);
        } catch (err) {
            Log.error("There was a Discord OAuth exception while getting a user.", {err});
            throw new Error("Discord returned an error while getting a user.");
        }
    }

    // MARK: static async getUserConnections
    /**
     * Gets the user's connections for a token.
     * @param {string} token The access token.
     * @returns {Promise<DiscordOAuthTypes.Connection[]>} A promise that returns the user's connections.
     */
    static async getUserConnections(token) {
        try {
            return await User.#oauth.getUserConnections(token);
        } catch (err) {
            Log.error("There was a Discord OAuth exception while getting a user's connections.", {err});
            throw new Error("Discord returned an error while getting a user's connections.");
        }
    }

    // MARK: static async refreshToken
    /**
     * Refreshes an access token.
     * @param {string} token The refresh token.
     * @returns {Promise<DiscordOAuthTypes.TokenRequestResult>} A promise that returns the token.
     */
    static async refreshToken(token) {
        try {
            return await User.#oauth.tokenRequest({
                refreshToken: token,
                scope: process.env.DISCORD_USERSCOPES,
                grantType: "refresh_token"
            });
        } catch (err) {
            Log.error("There was a Discord OAuth exception while refreshing a token.", {err});
            throw new Error("Discord returned an error while refreshing a token.");
        }
    }

    // MARK: static async revokeToken
    /**
     * Revokes an access token.
     * @param {string} token The token.
     * @returns {Promise} A promise that resolves when the access token as been revoked.
     */
    static async revokeToken(token) {
        try {
            return await User.#oauth.revokeToken(token);
        } catch (err) {
            Log.error("There was a Discord OAuth exception while revoking a token.", {err});
            throw new Error("Discord returned an error while revoking a token.");
        }
    }
}

module.exports = User;
