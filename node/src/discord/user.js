/**
 * @typedef {import("../../types/node/discordOAuthTypes").Connection} DiscordOAuthTypes.Connection
 * @typedef {import("../../types/node/discordOAuthTypes").TokenRequestResult} DiscordOAuthTypes.TokenRequestResult
 * @typedef {import("../../types/node/discordOAuthTypes").User} DiscordOAuthTypes.User
 */

const crypto = require("crypto"),
    Discord = require("discord.js"),
    Log = require("@roncli/node-application-insights-logger");

// MARK: class User
/**
 * A class that handles all Discord user interactions.
 */
class User {
    static #discordApiBase = `https://discord.com/api/v${Discord.APIVersion}`;
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

        const params = new URLSearchParams({
            client_id: process.env.DISCORD_CLIENTID,
            redirect_uri: process.env.DISCORD_REDIRECT_URI,
            response_type: "code",
            scope: process.env.DISCORD_USERSCOPES,
            state
        });

        return `${User.#discordApiBase}/oauth2/authorize?${params.toString()}`;
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
            const body = new URLSearchParams({
                client_id: process.env.DISCORD_CLIENTID,
                client_secret: process.env.DISCORD_CLIENTSECRET,
                grant_type: "authorization_code",
                code,
                redirect_uri: process.env.DISCORD_REDIRECT_URI
            });

            const response = await fetch(`${User.#discordApiBase}/oauth2/token`, {
                method: "POST",
                body: body.toString(),
                headers: {"Content-Type": "application/x-www-form-urlencoded"}
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch token: ${response.statusText}`);
            }

            const token = await response.json();
            User.#validStates.delete(state);

            return token;
        } catch (err) {
            if (err instanceof Error && err.message.indexOf("400 Bad Request") !== -1) {
                return void 0;
            }

            Log.error("There was a Discord OAuth exception while getting a token.", {err});
            throw new Error("Discord returned an error while getting a token.", {cause: err});
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
            const response = await fetch(`${User.#discordApiBase}/users/@me`, {
                method: "GET",
                headers: {Authorization: `Bearer ${token}`}
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch user: ${response.statusText}`);
            }

            return await response.json();
        } catch (err) {
            Log.error("There was a Discord OAuth exception while getting a user.", {err});
            throw new Error("Discord returned an error while getting a user.", {cause: err});
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
            const response = await fetch(`${User.#discordApiBase}/users/@me/connections`, {
                method: "GET",
                headers: {Authorization: `Bearer ${token}`}
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch user connections: ${response.statusText}`);
            }

            return await response.json();
        } catch (err) {
            Log.error("There was a Discord OAuth exception while getting a user's connections.", {err});
            throw new Error("Discord returned an error while getting a user's connections.", {cause: err});
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
            const body = new URLSearchParams({
                client_id: process.env.DISCORD_CLIENTID,
                client_secret: process.env.DISCORD_CLIENTSECRET,
                grant_type: "refresh_token",
                refresh_token: token
            });

            const response = await fetch(`${User.#discordApiBase}/oauth2/token`, {
                method: "POST",
                body: body.toString(),
                headers: {"Content-Type": "application/x-www-form-urlencoded"}
            });

            if (!response.ok) {
                throw new Error(`Failed to refresh token: ${response.statusText}`);
            }

            return await response.json();
        } catch (err) {
            Log.error("There was a Discord OAuth exception while refreshing a token.", {err});
            throw new Error("Discord returned an error while refreshing a token.", {cause: err});
        }
    }

    // MARK: static async revokeToken
    /**
     * Revokes an access token.
     * @param {string} token The token.
     * @returns {Promise<object>} A promise that returns an empty object if successful.
     */
    static async revokeToken(token) {
        try {
            const body = new URLSearchParams({
                client_id: process.env.DISCORD_CLIENTID,
                client_secret: process.env.DISCORD_CLIENTSECRET,
                token
            });

            const response = await fetch(`${User.#discordApiBase}/oauth2/token/revoke`, {
                method: "POST",
                body: body.toString(),
                headers: {"Content-Type": "application/x-www-form-urlencoded"}
            });

            if (!response.ok) {
                throw new Error(`Failed to revoke token: ${response.statusText}`);
            }

            return {};
        } catch (err) {
            Log.error("There was a Discord OAuth exception while revoking a token.", {err});
            throw new Error("Discord returned an error while revoking a token.", {cause: err});
        }
    }
}

module.exports = User;
