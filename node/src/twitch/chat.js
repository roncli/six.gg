/**
 * @typedef {import("@twurple/auth").AuthProvider} AuthProvider
 */

const ChatClient = require("@twurple/chat").ChatClient;

//   ###   #              #
//  #   #  #              #
//  #      # ##    ###   ####
//  #      ##  #      #   #
//  #      #   #   ####   #
//  #   #  #   #  #   #   #  #
//   ###   #   #   ####    ##
/**
 * A class that handles Twitch chat.
 */
class Chat {
    //                           #                       #
    //                           #                       #
    //  ##    ##   ###    ###   ###   ###   #  #   ##   ###    ##   ###
    // #     #  #  #  #  ##      #    #  #  #  #  #      #    #  #  #  #
    // #     #  #  #  #    ##    #    #     #  #  #      #    #  #  #
    //  ##    ##   #  #  ###      ##  #      ###   ##     ##   ##   #
    /**
     * Performs setup of Twitch chat.
     * @param {AuthProvider} authProvider The auth provider.
     */
    constructor(authProvider) {
        this.client = new ChatClient({
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
