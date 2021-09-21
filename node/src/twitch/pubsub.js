/**
 * @typedef {import("@twurple/auth").AuthProvider} AuthProvider
 */

const TwitchPubSubClient = require("@twurple/pubsub"),
    BaseTwitchPubSub = TwitchPubSubClient.BasicPubSubClient,
    TwitchPubSub = TwitchPubSubClient.PubSubClient;

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
     * @returns {Promise} A promise that resolves when the PubSub are setup.
     */
    async setup(authProvider) {
        this.client = new TwitchPubSub(new BaseTwitchPubSub({
            logger: {
                colors: false
            }
        }));
        await this.client.registerUserListener(authProvider);
    }
}

module.exports = PubSub;
