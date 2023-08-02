/**
 * @typedef {import("@twurple/auth").AuthProvider} AuthProvider
 */

const TwitchPubSubClient = require("@twurple/pubsub"),
    PubSubClient = TwitchPubSubClient.PubSubClient;

//  ####          #       ###          #
//  #   #         #      #   #         #
//  #   #  #   #  # ##   #      #   #  # ##
//  ####   #   #  ##  #   ###   #   #  ##  #
//  #      #   #  #   #      #  #   #  #   #
//  #      #  ##  ##  #  #   #  #  ##  ##  #
//  #       ## #  # ##    ###    ## #  # ##
/**
 * A class that handles Twitch PubSub.
 */
class PubSub {
    //               #
    //               #
    //  ###    ##   ###   #  #  ###
    // ##     # ##   #    #  #  #  #
    //   ##   ##     #    #  #  #  #
    // ###     ##     ##   ###  ###
    //                          #
    /**
     * Performs setup of Twitch PubSub.
     * @param {AuthProvider} authProvider The auth provider.
     * @returns {void}
     */
    setup(authProvider) {
        this.client = new PubSubClient({
            authProvider,
            logger: {colors: false}
        });
    }
}

module.exports = PubSub;
