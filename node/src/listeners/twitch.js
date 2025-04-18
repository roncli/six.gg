/**
 * @typedef {import("../../types/node/twitchListenerTypes").ActionEvent} TwitchListenerTypes.ActionEvent
 * @typedef {import("../../types/node/twitchListenerTypes").BitsEvent} TwitchListenerTypes.BitsEvent
 * @typedef {import("../../types/node/twitchListenerTypes").ErrorEvent} TwitchListenerTypes.ErrorEvent
 * @typedef {import("../../types/node/twitchListenerTypes").FollowEvent} TwitchListenerTypes.FollowEvent
 * @typedef {import("../../types/node/twitchListenerTypes").GiftPrimeEvent} TwitchListenerTypes.GiftPrimeEvent
 * @typedef {import("../../types/node/twitchListenerTypes").MessageEvent} TwitchListenerTypes.MessageEvent
 * @typedef {import("../../types/node/twitchListenerTypes").RaidedEvent} TwitchListenerTypes.RaidedEvent
 * @typedef {import("../../types/node/twitchListenerTypes").RedemptionEvent} TwitchListenerTypes.RedemptionEvent
 * @typedef {import("../../types/node/twitchListenerTypes").ResubEvent} TwitchListenerTypes.ResubEvent
 * @typedef {import("../../types/node/twitchListenerTypes").RitualEvent} TwitchListenerTypes.RitualEvent
 * @typedef {import("../../types/node/twitchListenerTypes").StreamEvent} TwitchListenerTypes.StreamEvent
 * @typedef {import("../../types/node/twitchListenerTypes").SubEvent} TwitchListenerTypes.SubEvent
 * @typedef {import("../../types/node/twitchListenerTypes").SubExtendEvent} TwitchListenerTypes.SubExtendEvent
 * @typedef {import("../../types/node/twitchListenerTypes").SubGiftEvent} TwitchListenerTypes.SubGiftEvent
 * @typedef {import("../../types/node/twitchListenerTypes").SubGiftCommunityEvent} TwitchListenerTypes.SubGiftCommunityEvent
 * @typedef {import("../../types/node/twitchListenerTypes").SubGiftCommunityPayForwardEvent} TwitchListenerTypes.SubGiftCommunityPayForwardEvent
 * @typedef {import("../../types/node/twitchListenerTypes").SubGiftPayForwardEvent} TwitchListenerTypes.SubGiftPayForwardEvent
 * @typedef {import("../../types/node/twitchListenerTypes").SubGiftUpgradeEvent} TwitchListenerTypes.SubGiftUpgradeEvent
 * @typedef {import("../../types/node/twitchListenerTypes").SubPrimeUpgradedEvent} TwitchListenerTypes.SubPrimeUpgradedEvent
 * @typedef {import("../../types/node/twitchListenerTypes").WhisperEvent} TwitchListenerTypes.WhisperEvent
 */

const Log = require("@roncli/node-application-insights-logger"),
    Discord = require("../discord"),
    Twitch = require("../twitch");

// MARK: class TwitchListener
/**
 * A class that handles listening to Twitch events.
 */
class TwitchListener {
    // MARK: static #getTierName
    /**
     * Gets the tier name based on the data from the Twitch API.
     * @param {string} tier The tier from the Twitch API.
     * @param {boolean} isPrime Whether the sub is a Prime sub.
     * @returns {string} The tier name.
     */
    static #getTierName = (tier, isPrime) => {
        switch (tier) {
            case "2000":
                return "Tier 2 Subscriber";
            case "3000":
                return "Tier 3 Subscriber";
            case "Prime":
                return "Prime Subscriber";
            case "1000":
            default:
                return `${isPrime ? "Prime " : ""}Subscriber`;
        }
    };

    // MARK: static action
    /**
     * Handles a chat action, ie: when the /me command is used.
     * @param {TwitchListenerTypes.ActionEvent} ev The action event.
     * @returns {void}
     */
    static action(ev) {
        if (ev.channel === process.env.TWITCH_CHANNEL) {
        }
    }

    // MARK: static bits
    /**
     * Handles when bits are cheered in the channel.
     * @param {TwitchListenerTypes.BitsEvent} ev The bits event.
     * @returns {void}
     */
    static bits(ev) {
        if (ev.isAnonymous) {
            Twitch.botChatClient.say(process.env.TWITCH_CHANNEL, `There has been an anonymous cheer of ${ev.name} bit${ev.bits === 1 ? "" : "s"}!`);
        } else {
            Twitch.botChatClient.say(process.env.TWITCH_CHANNEL, `Thanks ${ev.name} for cheering with ${ev.bits} bit${ev.bits === 1 ? "" : "s"}!${ev.totalBits && ev.totalBits !== ev.bits ? `  They have cheered a total of ${ev.totalBits} bits!` : ""}`);
        }
    }

    // MARK: static error
    /**
     * Handles an error thrown from Twitch.
     * @param {TwitchListenerTypes.ErrorEvent} ev The error event.
     * @returns {void}
     */
    static error(ev) {
        Log.error(`An error event was received from Twitch: ${ev.message}`, {err: ev.err});
    }

    // MARK: static follow
    /**
     * Handles when the channel is followed.
     * @param {TwitchListenerTypes.FollowEvent} ev The follow event.
     * @returns {void}
     */
    static follow(ev) {
        Twitch.botChatClient.say(process.env.TWITCH_CHANNEL, `Thank you for following Six Gaming, ${ev.name}!`);
    }

    // MARK: static giftPrime
    /**
     * Handles when a Prime gift is given.
     * @param {TwitchListenerTypes.GiftPrimeEvent} ev The gift prime event.
     * @returns {void}
     */
    static giftPrime(ev) {
        if (ev.channel === process.env.TWITCH_CHANNEL) {
            Twitch.botChatClient.say(process.env.TWITCH_CHANNEL, `${ev.name} has gifted ${ev.gift}, a Prime gift, to the community!`);
        }
    }

    // MARK: static message
    /**
     * Handles when a message is posted in chat.
     * @param {TwitchListenerTypes.MessageEvent} ev The message event.
     * @returns {void}
     */
    static message(ev) {
        if (ev.channel === process.env.TWITCH_CHANNEL) {}
    }

    // MARK: static offline
    /**
     * Handles when the stream goes offline.
     * @returns {void}
     */
    static offline() {}

    // MARK: static raided
    /**
     * Handles when the stream is raided.
     * @param {TwitchListenerTypes.RaidedEvent} ev The raided event.
     * @returns {void}
     */
    static raided(ev) {
        if (ev.channel === process.env.TWITCH_CHANNEL) {
            Twitch.botChatClient.say(process.env.TWITCH_CHANNEL, `Thanks for the raid, ${ev.name}!  Everyone, be sure to visit https://twitch.tv/${ev.user} to check out their stream!`);
        }
    }

    // MARK: static redemption
    /**
     * Handles when channel points are redeemed in the channel.
     * @returns {void}
     */
    static redemption() {}

    // MARK: static resub
    /**
     * Handles when a sub is renewed.
     * @param {TwitchListenerTypes.ResubEvent} ev The resub event.
     * @returns {void}
     */
    static resub(ev) {
        if (ev.channel === process.env.TWITCH_CHANNEL) {
            Twitch.botChatClient.say(process.env.TWITCH_CHANNEL, `Thanks ${ev.name} for continuing to be a ${TwitchListener.#getTierName(ev.tier, ev.isPrime)}!${ev.months && ev.months > 1 ? `  They have been subscribed for ${ev.months} months${ev.streak && ev.streak === ev.months ? " in a row!" : ""}${ev.streak && ev.streak > 1 && ev.streak !== ev.months ? ` and for ${ev.streak} months in a row!` : ""}!` : ""}`);
        }
    }

    // MARK: static ritual
    /**
     * Handles when a ritual occurs in chat.
     * @param {TwitchListenerTypes.RitualEvent} ev The ritual event.
     * @returns {void}
     */
    static ritual(ev) {
        if (ev.channel === process.env.TWITCH_CHANNEL) {}
    }

    // MARK: static async stream
    /**
     * Handles when the stream goes live.
     * @param {TwitchListenerTypes.StreamEvent} ev The stream event.
     * @returns {Promise} A promise that is resolved when the event has been processed.
     */
    static async stream(ev) {
        const user = await Twitch.botTwitchClient.users.getUserByName(process.env.TWITCH_CHANNEL);
        if (!user) {
            return;
        }

        const channel = await Twitch.botTwitchClient.channels.getChannelInfoById(user.id);
        if (!channel) {
            return;
        }

        const message = Discord.embedBuilder({
            timestamp: new Date(),
            thumbnail: {
                url: user.profilePictureUrl,
                width: 300,
                height: 300
            },
            url: `https://twitch.tv/${user.name}`,
            description: `What's going on everyone?  Six Gaming is LIVE on Twitch!  Watch at https://twitch.tv/${user.name}`,
            fields: [
                {
                    name: "Stream Title",
                    value: ev.title
                }
            ]
        });

        if (ev.game) {
            message.addFields({
                name: "Now Playing",
                value: ev.game,
                inline: false
            });
        }

        await Discord.richQueue(message, Discord.findTextChannelByName("live-stream-announcements"));
    }

    // MARK: static sub
    /**
     * Handles a sub to the channel.
     * @param {TwitchListenerTypes.SubEvent} ev The sub event.
     * @returns {void}
     */
    static sub(ev) {
        if (ev.channel === process.env.TWITCH_CHANNEL) {
            Twitch.botChatClient.say(process.env.TWITCH_CHANNEL, `Thanks ${ev.name} for becoming a ${TwitchListener.#getTierName(ev.tier, ev.isPrime)}!${ev.months && ev.months > 1 ? `  They have been subscribed for ${ev.months} months${ev.streak && ev.streak === ev.months ? " in a row!" : ""}${ev.streak && ev.streak > 1 && ev.streak !== ev.months ? ` and for ${ev.streak} months in a row!` : ""}!` : ""}`);
        }
    }

    // MARK: static subExtend
    /**
     * Handles when a sub is extended via a sub token.
     * @param {TwitchListenerTypes.SubExtendEvent} ev The sub extend event.
     * @returns {void}
     */
    static subExtend(ev) {
        if (ev.channel === process.env.TWITCH_CHANNEL) {
            Twitch.botChatClient.say(process.env.TWITCH_CHANNEL, `Thanks ${ev.name} for becoming a ${TwitchListener.#getTierName(ev.tier, false)}!${ev.months && ev.months > 1 ? `  They have been subscribed for ${ev.months} months!` : ""}`);
        }
    }

    // MARK: static subGift
    /**
     * Handles when a sub is gifted to a user.
     * @param {TwitchListenerTypes.SubGiftEvent} ev The sub gift event.
     * @returns {void}
     */
    static subGift(ev) {
        if (ev.channel === process.env.TWITCH_CHANNEL) {
            Twitch.botChatClient.say(process.env.TWITCH_CHANNEL, `Thanks ${ev.gifterName} for making ${ev.name} a ${TwitchListener.#getTierName(ev.tier, false)}!`);
        }
    }

    // MARK: static subGiftCommunity
    /**
     * Handles when subs are gifted to the community.
     * @param {TwitchListenerTypes.SubGiftCommunityEvent} ev The sub gift community event.
     * @returns {void}
     */
    static subGiftCommunity(ev) {
        if (ev.channel === process.env.TWITCH_CHANNEL) {
            Twitch.botChatClient.say(process.env.TWITCH_CHANNEL, `Thanks ${ev.name} for making ${ev.giftCount} new ${TwitchListener.#getTierName(ev.tier, false)}s!${ev.totalGiftCount && ev.giftCount !== ev.totalGiftCount ? `  They have gifted ${ev.totalGiftCount} total subscriptions in the channel!` : ""}`);
        }
    }

    // MARK: static subGiftCommunityPayForward
    /**
     * Handles when a sub gifted to the community was payed forward by the recipient.
     * @param {TwitchListenerTypes.SubGiftCommunityPayForwardEvent} ev The sub gift pay forward event.
     * @returns {void}
     */
    static subGiftCommunityPayForward(ev) {
        if (ev.channel === process.env.TWITCH_CHANNEL) {
            Twitch.botChatClient.say(process.env.TWITCH_CHANNEL, `Thanks ${ev.name} for paying forward ${ev.originalGifter}'s gift subscription!`);
        }
    }

    // MARK: static subGiftPayForward
    /**
     * Handles when a sub gifted to a user was payed forward.
     * @param {TwitchListenerTypes.SubGiftPayForwardEvent} ev The sub pay forward event.
     * @returns {void}
     */
    static subGiftPayForward(ev) {
        if (ev.channel === process.env.TWITCH_CHANNEL) {
            Twitch.botChatClient.say(process.env.TWITCH_CHANNEL, `Thanks ${ev.name} for paying forward ${ev.originalGifter}'s gift subscription to ${ev.recipient}!`);
        }
    }

    // MARK: static subGiftUpgrade
    /**
     * Handles when a gifted sub is upgraded to a regular sub.
     * @param {TwitchListenerTypes.SubGiftUpgradeEvent} ev The sub gift upgrade event.
     * @returns {void}
     */
    static subGiftUpgrade(ev) {
        if (ev.channel === process.env.TWITCH_CHANNEL) {
            Twitch.botChatClient.say(process.env.TWITCH_CHANNEL, `Thanks ${ev.name} for remaining a ${TwitchListener.#getTierName(ev.tier, false)}, continuing the gift subscription from ${ev.gifter}!`);
        }
    }

    // MARK: static subPrimeUpgraded
    /**
     * Handles when a sub prime is upgraded to a regular sub.
     * @param {TwitchListenerTypes.SubPrimeUpgradedEvent} ev The sub prime upgraded event.
     * @returns {void}
     */
    static subPrimeUpgraded(ev) {
        if (ev.channel === process.env.TWITCH_CHANNEL) {
            Twitch.botChatClient.say(process.env.TWITCH_CHANNEL, `Thanks ${ev.name} for upgrading their Prime subscription and becoming a full ${TwitchListener.#getTierName(ev.tier, false)}!`);
        }
    }

    // MARK: static whisper
    /**
     * Handles when the bot is whispered.
     * @returns {void}
     */
    static whisper() {}
}

module.exports = TwitchListener;
