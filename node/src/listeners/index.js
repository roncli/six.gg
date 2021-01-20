const Discord = require("../discord"),
    DiscordListener = require("./discord"),
    Twitch = require("../twitch"),
    TwitchListener = require("./twitch");

//  #        #            #
//  #                     #
//  #       ##     ###   ####    ###   # ##    ###   # ##    ###
//  #        #    #       #     #   #  ##  #  #   #  ##  #  #
//  #        #     ###    #     #####  #   #  #####  #       ###
//  #        #        #   #  #  #      #   #  #      #          #
//  #####   ###   ####     ##    ###   #   #   ###   #      ####
/**
 * A class that sets up listening to eventEmitters.
 */
class Listeners {
    //               #
    //               #
    //  ###    ##   ###   #  #  ###
    // ##     # ##   #    #  #  #  #
    //   ##   ##     #    #  #  #  #
    // ###     ##     ##   ###  ###
    //                          #
    /**
     * Sets up the listeners for Twitch and Websockets.
     * @returns {void}
     */
    static setup() {
        Object.getOwnPropertyNames(DiscordListener).filter((property) => typeof DiscordListener[property] === "function").forEach((property) => {
            Discord.events.on(property, DiscordListener[property]);
        });

        Object.getOwnPropertyNames(TwitchListener).filter((property) => typeof TwitchListener[property] === "function").forEach((property) => {
            Twitch.events.on(property, TwitchListener[property]);
        });
    }
}

module.exports = Listeners;
