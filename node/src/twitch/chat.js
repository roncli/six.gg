/**
 * @typedef {import("twitch").AuthProvider} AuthProvider
 */

const ChatClient = require("twitch-chat-client").ChatClient;

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
     * @param {AuthProvider} authProvider The twitch client.
     */
    constructor(authProvider) {
        this.client = new ChatClient(authProvider, {
            channels: [process.env.TWITCH_CHANNEL],
            requestMembershipEvents: true
        });
    }
}

module.exports = Chat;
