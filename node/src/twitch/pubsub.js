/**
 * @typedef {import("twitch").ApiClient} TwitchClient
 */

const TwitchPubSubClient = require("twitch-pubsub-client"),
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
     * @param {TwitchClient} twitchClient The twitch client.
     * @returns {Promise} A promise that resolves when the PubSub are setup.
     */
    async setup(twitchClient) {
        this.client = new TwitchPubSub(new BaseTwitchPubSub({
            logger: {
                colors: false
            }
        }));
        await this.client.registerUserListener(twitchClient);
    }
}

module.exports = PubSub;
