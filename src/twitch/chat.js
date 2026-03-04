/**
 * @typedef {import("@twurple/auth").AuthProvider} AuthProvider
 */

const TwurpleChat = require("@twurple/chat");

// MARK: class Chat
/**
 * A class that handles Twitch chat.
 */
class Chat {
    // MARK: constructor
    /**
     * Performs setup of Twitch chat.
     * @param {AuthProvider} authProvider The auth provider.
     */
    constructor(authProvider) {
        this.client = new TwurpleChat.ChatClient({
            authProvider,
            channels: [process.env.TWITCH_CHANNEL],
            requestMembershipEvents: true,
            logger: {
                colors: false
            }
        });
    }
}

module.exports = Chat;
