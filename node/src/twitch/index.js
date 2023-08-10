/**
 * @typedef {import("@twurple/chat").ChatClient} ChatClient
 * @typedef {import("../../types/node/igdbTypes").SearchGameResult} IGDBTypes.SearchGameResult
 */

const events = require("events"),
    IGDB = require("igdb-api-node"),
    Log = require("@roncli/node-application-insights-logger"),
    TwitchAuth = require("@twurple/auth"),
    TwitchClient = require("@twurple/api").ApiClient,

    Chat = require("./chat"),
    EventSub = require("./eventsub"),
    Exception = require("../errors/exception"),
    PubSub = require("./pubsub"),
    TwitchDb = require("../database/twitch");

/** @type {TwitchAuth.AppTokenAuthProvider} */
let apiAuthProvider;

/** @type {string} */
let botAccessToken;

/** @type {TwitchAuth.RefreshingAuthProvider} */
let botAuthProvider;

/** @type {string} */
let botRefreshToken;

/** @type {Chat} */
let botChatClient;

/** @type {TwitchClient} */
let botTwitchClient;

/** @type {string} */
let channelAccessToken;

/** @type {TwitchAuth.RefreshingAuthProvider} */
let channelAuthProvider;

/** @type {string} */
let channelRefreshToken;

/** @type {TwitchClient} */
let channelTwitchClient;

/** @type {Chat} */
let channelChatClient;

/** @type {PubSub} */
let pubsub;

/** @type {string} */
let state;

const eventEmitter = new events.EventEmitter();

//  #####           #     #            #
//    #                   #            #
//    #    #   #   ##    ####    ###   # ##
//    #    #   #    #     #     #   #  ##  #
//    #    # # #    #     #     #      #   #
//    #    # # #    #     #  #  #   #  #   #
//    #     # #    ###     ##    ###   #   #
/**
 * Handles Twitch integration.
 */
class Twitch {
    // #            #     ##   #            #     ##   ##     #                 #
    // #            #    #  #  #            #    #  #   #                       #
    // ###    ##   ###   #     ###    ###  ###   #      #    ##     ##   ###   ###
    // #  #  #  #   #    #     #  #  #  #   #    #      #     #    # ##  #  #   #
    // #  #  #  #   #    #  #  #  #  # ##   #    #  #   #     #    ##    #  #   #
    // ###    ##     ##   ##   #  #   # #    ##   ##   ###   ###    ##   #  #    ##
    /**
     * Gets the current Twitch bot chat client.
     * @returns {ChatClient} The current Twitch bot client.
     */
    static get botChatClient() {
        return botChatClient.client;
    }

    // #            #    ###          #     #          #      ##   ##     #                 #
    // #            #     #                 #          #     #  #   #                       #
    // ###    ##   ###    #    #  #  ##    ###    ##   ###   #      #    ##     ##   ###   ###
    // #  #  #  #   #     #    #  #   #     #    #     #  #  #      #     #    # ##  #  #   #
    // #  #  #  #   #     #    ####   #     #    #     #  #  #  #   #     #    ##    #  #   #
    // ###    ##     ##   #    ####  ###     ##   ##   #  #   ##   ###   ###    ##   #  #    ##
    /**
     * Gets the current Twitch bot client.
     * @returns {TwitchClient} The current Twitch client.
     */
    static get botTwitchClient() {
        return botTwitchClient;
    }

    //       #                             ##    ###          #     #          #      ##   ##     #                 #
    //       #                              #     #                 #          #     #  #   #                       #
    //  ##   ###    ###  ###   ###    ##    #     #    #  #  ##    ###    ##   ###   #      #    ##     ##   ###   ###
    // #     #  #  #  #  #  #  #  #  # ##   #     #    #  #   #     #    #     #  #  #      #     #    # ##  #  #   #
    // #     #  #  # ##  #  #  #  #  ##     #     #    ####   #     #    #     #  #  #  #   #     #    ##    #  #   #
    //  ##   #  #   # #  #  #  #  #   ##   ###    #    ####  ###     ##   ##   #  #   ##   ###   ###    ##   #  #    ##
    /**
     * Gets the current channel Twitch client.
     * @returns {TwitchClient} The current Twitch client.
     */
    static get channelTwitchClient() {
        return channelTwitchClient;
    }

    //         #           #
    //         #           #
    //  ###   ###    ###  ###    ##
    // ##      #    #  #   #    # ##
    //   ##    #    # ##   #    ##
    // ###      ##   # #    ##   ##
    /**
     * Gets the state.
     * @returns {string} The state.
     */
    static get state() {
        return state;
    }

    /**
     * Sets the state.
     * @param {string} value The state.
     */
    static set state(value) {
        state = value;
    }

    //                                      #
    //                                      #
    //  ##    ##   ###   ###    ##    ##   ###
    // #     #  #  #  #  #  #  # ##  #      #
    // #     #  #  #  #  #  #  ##    #      #
    //  ##    ##   #  #  #  #   ##    ##     ##
    /**
     * Connects to Twitch.
     * @returns {Promise<boolean>} A promise that returns whether the Twitch client is ready.
     */
    static async connect() {
        let tokens;
        try {
            tokens = await TwitchDb.get();
        } catch (err) {
            throw new Exception("There was an error getting the Twitch tokens.", err);
        }

        if (!tokens || !tokens.channelAccessToken || !tokens.channelRefreshToken || !tokens.botAccessToken || !tokens.botRefreshToken) {
            tokens = {
                botAccessToken: process.env.TWITCH_BOT_ACCESSTOKEN,
                botRefreshToken: process.env.TWITCH_BOT_REFRESHTOKEN,
                channelAccessToken: process.env.TWITCH_CHANNEL_ACCESSTOKEN,
                channelRefreshToken: process.env.TWITCH_CHANNEL_REFRESHTOKEN
            };

            try {
                await TwitchDb.set(tokens);
            } catch (err) {
                throw new Exception("There was an error setting the Twitch tokens on connecting.", err);
            }
        }

        channelAccessToken = tokens.channelAccessToken;
        channelRefreshToken = tokens.channelRefreshToken;
        botAccessToken = tokens.botAccessToken;
        botRefreshToken = tokens.botRefreshToken;

        if (!channelAccessToken || !channelRefreshToken || !botAccessToken || !botRefreshToken) {
            return false;
        }

        if (!channelAuthProvider || !botAuthProvider) {
            Log.verbose("Logging into Twitch...");
            try {
                await Twitch.login();
            } catch (err) {
                Log.error("Error connecting to Twitch.", {err});
            }

            Log.verbose("Connected to Twitch.");
        }

        return !!(channelAuthProvider && botAuthProvider);
    }

    //                          #
    //                          #
    //  ##   # #    ##   ###   ###    ###
    // # ##  # #   # ##  #  #   #    ##
    // ##    # #   ##    #  #   #      ##
    //  ##    #     ##   #  #    ##  ###
    /**
     * Returns the EventEmitter for Twitch events.
     * @returns {events.EventEmitter} The EventEmitter object.
     */
    static get events() {
        return eventEmitter;
    }

    // ##                 #
    //  #
    //  #     ##    ###  ##    ###
    //  #    #  #  #  #   #    #  #
    //  #    #  #   ##    #    #  #
    // ###    ##   #     ###   #  #
    //              ###
    /**
     * Logs in to Twitch and creates the Twitch client.
     * @returns {Promise} A promise that resolves when login is complete.
     */
    static async login() {
        channelAuthProvider = new TwitchAuth.RefreshingAuthProvider({
            clientId: process.env.TWITCH_CLIENTID,
            clientSecret: process.env.TWITCH_CLIENTSECRET
        });

        channelAuthProvider.onRefresh(async (userId, token) => {
            channelAccessToken = token.accessToken;
            channelRefreshToken = token.refreshToken;
            try {
                await TwitchDb.set({
                    botAccessToken,
                    botRefreshToken,
                    channelAccessToken,
                    channelRefreshToken
                });
            } catch (err) {
                throw new Exception("There was an error setting the Twitch tokens on refreshing the channel tokens.", err);
            }
        });

        await channelAuthProvider.addUserForToken({
            accessToken: channelAccessToken,
            refreshToken: channelRefreshToken,
            expiresIn: void 0,
            obtainmentTimestamp: void 0,
            scope: process.env.TWITCH_CHANNEL_SCOPES.split(" ")
        }, ["chat"]);

        botAuthProvider = new TwitchAuth.RefreshingAuthProvider({
            clientId: process.env.TWITCH_CLIENTID,
            clientSecret: process.env.TWITCH_CLIENTSECRET
        });

        botAuthProvider.onRefresh(async (userId, token) => {
            botAccessToken = token.accessToken;
            botRefreshToken = token.refreshToken;
            try {
                await TwitchDb.set({
                    botAccessToken,
                    botRefreshToken,
                    channelAccessToken,
                    channelRefreshToken
                });
            } catch (err) {
                throw new Exception("There was an error setting the Twitch tokens on refreshing the bot tokens.", err);
            }
        });

        await botAuthProvider.addUserForToken({
            accessToken: botAccessToken,
            refreshToken: botRefreshToken,
            expiresIn: void 0,
            obtainmentTimestamp: void 0,
            scope: process.env.TWITCH_BOT_SCOPES.split(" ")
        }, ["chat"]);

        await channelAuthProvider.refreshAccessTokenForUser(process.env.TWITCH_CHANNEL_USERID);
        await botAuthProvider.refreshAccessTokenForUser(process.env.TWITCH_BOT_USERID);

        channelTwitchClient = new TwitchClient({
            authProvider: channelAuthProvider,
            logger: {
                colors: false
            }
        });

        channelTwitchClient.requestScopesForUser(process.env.TWITCH_CHANNEL_USERID, process.env.TWITCH_CHANNEL_SCOPES.split(" "));

        botTwitchClient = new TwitchClient({
            authProvider: botAuthProvider,
            logger: {
                colors: false
            }
        });

        botTwitchClient.requestScopesForUser(process.env.TWITCH_BOT_USERID, process.env.TWITCH_BOT_SCOPES.split(" "));

        apiAuthProvider = new TwitchAuth.AppTokenAuthProvider(process.env.TWITCH_CLIENTID, process.env.TWITCH_CLIENTSECRET);

        await Twitch.setupChat();
        await Twitch.setupPubSub();
    }

    // ##                             #
    //  #                             #
    //  #     ##    ###   ##   #  #  ###
    //  #    #  #  #  #  #  #  #  #   #
    //  #    #  #   ##   #  #  #  #   #
    // ###    ##   #      ##    ###    ##
    //              ###
    /**
     * Logs out of Twitch.
     * @returns {Promise} A promise that resolves when the logout is complete.
     */
    static async logout() {
        try {
            await channelChatClient.client.quit();
        } catch (err) {}
        channelChatClient = void 0;

        try {
            await botChatClient.client.quit();
        } catch (err) {}
        botChatClient = void 0;
    }

    //               #                      #     ###         #
    //              # #                     #      #          #
    // ###    ##    #    ###    ##    ###   ###    #     ##   # #    ##   ###    ###
    // #  #  # ##  ###   #  #  # ##  ##     #  #   #    #  #  ##    # ##  #  #  ##
    // #     ##     #    #     ##      ##   #  #   #    #  #  # #   ##    #  #    ##
    // #      ##    #    #      ##   ###    #  #   #     ##   #  #   ##   #  #  ###
    /**
     * Refreshes Twitch tokens.
     * @returns {Promise} A promsie that resolves when the tokens are refreshed.
     */
    static async refreshTokens() {
        try {
            await channelAuthProvider.refreshAccessTokenForUser(process.env.TWITCH_CHANNEL_USERID);
            await botAuthProvider.refreshAccessTokenForUser(process.env.TWITCH_BOT_USERID);
        } catch (err) {
            eventEmitter.emit("error", {
                message: "Error refreshing twitch client tokens.",
                err
            });
        }

        await Twitch.logout();
        await Twitch.connect();
        await Twitch.login();
    }

    //                                #      ##                     #      #            #
    //                                #     #  #                    #                   #
    //  ###    ##    ###  ###    ##   ###   #      ###  # #    ##   #     ##     ###   ###
    // ##     # ##  #  #  #  #  #     #  #  # ##  #  #  ####  # ##  #      #    ##      #
    //   ##   ##    # ##  #     #     #  #  #  #  # ##  #  #  ##    #      #      ##    #
    // ###     ##    # #  #      ##   #  #   ###   # #  #  #   ##   ####  ###   ###      ##
    /**
     * Searches IGDB for a game.
     * @param {string} search The game to search for.
     * @returns {Promise<IGDBTypes.SearchGameResult[]>} A promise that returns the game from IGDB.
     */
    static async searchGameList(search) {
        const client = IGDB.default(apiAuthProvider.clientId, (await apiAuthProvider.getAppAccessToken()).accessToken),
            res = await client.where(`name ~ "${search.replace(/"/g, "\\\"")}"*`).fields(["id", "name", "cover.url"]).limit(50).request("/games");

        return res.data;
    }

    //               #     ##    #                            ###           #
    //               #    #  #   #                             #           # #
    //  ###    ##   ###    #    ###   ###    ##    ###  # #    #    ###    #     ##
    // ##     # ##   #      #    #    #  #  # ##  #  #  ####   #    #  #  ###   #  #
    //   ##   ##     #    #  #   #    #     ##    # ##  #  #   #    #  #   #    #  #
    // ###     ##     ##   ##     ##  #      ##    # #  #  #  ###   #  #   #     ##
    /**
     * Sets the stream's title and game.
     * @param {string} title The title of the stream.
     * @param {string} game The game.
     * @returns {Promise} A promise that resolves when the stream's info has been set.
     */
    static async setStreamInfo(title, game) {
        let gameId;
        try {
            const gameData = await channelTwitchClient.games.getGameByName(game);

            gameId = gameData.id;
        } catch (err) {}

        await channelTwitchClient.channels.updateChannelInfo(process.env.TWITCH_CHANNEL_USERID, {title, gameId});
    }

    //               #                ####                     #     ##         #
    //               #                #                        #    #  #        #
    //  ###    ##   ###   #  #  ###   ###   # #    ##   ###   ###    #    #  #  ###
    // ##     # ##   #    #  #  #  #  #     # #   # ##  #  #   #      #   #  #  #  #
    //   ##   ##     #    #  #  #  #  #     # #   ##    #  #   #    #  #  #  #  #  #
    // ###     ##     ##   ###  ###   ####   #     ##   #  #    ##   ##    ###  ###
    //                          #
    /**
     * Sets up the Twitch EventSub.
     * @returns {Promise} A promise that resolves when the EventSub is setup.
     */
    static async setupEventSub() {
        await EventSub.client.onChannelFollow(process.env.TWITCH_CHANNEL_USERID, process.env.TWITCH_CHANNEL_USERID, async (follow) => {
            eventEmitter.emit("follow", {
                userId: follow.userId,
                user: (await follow.getUser()).name,
                name: follow.userDisplayName,
                date: follow.followDate
            });
        });

        await EventSub.client.onStreamOnline(process.env.TWITCH_CHANNEL_USERID, async (data) => {
            const stream = await data.getStream();

            eventEmitter.emit("stream", {
                title: stream.title,
                game: stream.gameName,
                id: stream.id,
                startDate: stream.startDate,
                thumbnailUrl: stream.thumbnailUrl
            });
        });

        await EventSub.client.onStreamOffline(process.env.TWITCH_CHANNEL_USERID, () => {
            eventEmitter.emit("offline");
        });
    }

    //               #                 ##   #            #
    //               #                #  #  #            #
    //  ###    ##   ###   #  #  ###   #     ###    ###  ###
    // ##     # ##   #    #  #  #  #  #     #  #  #  #   #
    //   ##   ##     #    #  #  #  #  #  #  #  #  # ##   #
    // ###     ##     ##   ###  ###    ##   #  #   # #    ##
    //                          #
    /**
     * Sets up the Twitch chat.
     * @returns {Promise} A promise that resolves when the Twitch chat is setup.
     */
    static async setupChat() {
        if (channelChatClient && channelChatClient.client) {
            try {
                await channelChatClient.client.quit();
            } catch (err) {} finally {}
        }
        channelChatClient = new Chat(channelAuthProvider);

        if (botChatClient && botChatClient.client) {
            try {
                await botChatClient.client.quit();
            } catch (err) {} finally {}
        }

        botChatClient = new Chat(botAuthProvider);

        channelChatClient.client.onAction((channel, user, message, msg) => {
            eventEmitter.emit("action", {
                channel: channel.charAt(0) === "#" ? channel.substring(1) : channel,
                user,
                name: msg.userInfo.displayName,
                message
            });
        });

        channelChatClient.client.onCommunityPayForward((channel, user, forwardInfo) => {
            eventEmitter.emit("subGiftCommunityPayForward", {
                channel: channel.charAt(0) === "#" ? channel.substring(1) : channel,
                user,
                name: forwardInfo.displayName,
                originalGifter: forwardInfo.originalGifterDisplayName
            });
        });

        channelChatClient.client.onCommunitySub((channel, user, subInfo) => {
            eventEmitter.emit("subGiftCommunity", {
                channel: channel.charAt(0) === "#" ? channel.substring(1) : channel,
                user,
                name: subInfo.gifterDisplayName,
                giftCount: subInfo.count,
                totalGiftCount: subInfo.gifterGiftCount,
                tier: subInfo.plan
            });
        });

        channelChatClient.client.onDisconnect((manually, reason) => {
            if (reason.message === "[1006] ") {
                // Ignore network disconnects.
                return;
            }
            if (reason) {
                Log.error("The streamer's Twitch chat disconnected.", {err: reason});
            }
        });

        channelChatClient.client.onGiftPaidUpgrade((channel, user, subInfo) => {
            eventEmitter.emit("subGiftUpgrade", {
                channel: channel.charAt(0) === "#" ? channel.substring(1) : channel,
                user,
                name: subInfo.displayName,
                gifter: subInfo.gifterDisplayName,
                tier: "Upgraded"
            });
        });

        channelChatClient.client.onMessage((channel, user, message, msg) => {
            eventEmitter.emit("message", {
                channel: channel.charAt(0) === "#" ? channel.substring(1) : channel,
                user,
                name: msg.userInfo.displayName,
                message,
                msg
            });
        });

        channelChatClient.client.onPrimeCommunityGift((channel, user, subInfo) => {
            eventEmitter.emit("giftPrime", {
                channel: channel.charAt(0) === "#" ? channel.substring(1) : channel,
                user: subInfo.gifter,
                name: subInfo.gifterDisplayName,
                gift: subInfo.name
            });
        });

        channelChatClient.client.onPrimePaidUpgrade((channel, user, subInfo) => {
            eventEmitter.emit("subPrimeUpgraded", {
                channel: channel.charAt(0) === "#" ? channel.substring(1) : channel,
                user,
                name: subInfo.displayName,
                tier: subInfo.plan
            });
        });

        channelChatClient.client.onRaid((channel, user, raidInfo) => {
            eventEmitter.emit("raided", {
                channel: channel.charAt(0) === "#" ? channel.substring(1) : channel,
                user,
                name: raidInfo.displayName,
                viewerCount: raidInfo.viewerCount
            });
        });

        channelChatClient.client.onResub((channel, user, subInfo) => {
            eventEmitter.emit("resub", {
                channel: channel.charAt(0) === "#" ? channel.substring(1) : channel,
                user,
                name: subInfo.displayName,
                isPrime: subInfo.isPrime,
                message: subInfo.message,
                months: subInfo.months,
                streak: subInfo.streak,
                tier: subInfo.plan
            });
        });

        channelChatClient.client.onRitual((channel, user, ritualInfo, msg) => {
            eventEmitter.emit("ritual", {
                channel: channel.charAt(0) === "#" ? channel.substring(1) : channel,
                user,
                name: msg.userInfo.displayName,
                message: ritualInfo.message,
                ritual: ritualInfo.ritualName
            });
        });

        channelChatClient.client.onStandardPayForward((channel, user, forwardInfo) => {
            eventEmitter.emit("subGiftPayForward", {
                channel: channel.charAt(0) === "#" ? channel.substring(1) : channel,
                user,
                name: forwardInfo.displayName,
                originalGifter: forwardInfo.originalGifterDisplayName,
                recipient: forwardInfo.recipientDisplayName
            });
        });

        channelChatClient.client.onSub((channel, user, subInfo) => {
            eventEmitter.emit("sub", {
                channel: channel.charAt(0) === "#" ? channel.substring(1) : channel,
                user,
                name: subInfo.displayName,
                isPrime: subInfo.isPrime,
                message: subInfo.message,
                months: subInfo.months,
                streak: subInfo.streak,
                tier: subInfo.plan
            });
        });

        channelChatClient.client.onSubExtend((channel, user, subInfo) => {
            eventEmitter.emit("subExtend", {
                channel: channel.charAt(0) === "#" ? channel.substring(1) : channel,
                user,
                displayName: subInfo.displayName,
                months: subInfo.months,
                tier: subInfo.plan
            });
        });

        channelChatClient.client.onSubGift((channel, user, subInfo) => {
            eventEmitter.emit("subGift", {
                channel: channel.charAt(0) === "#" ? channel.substring(1) : channel,
                user,
                name: subInfo.displayName,
                gifterUser: subInfo.gifter,
                gifterName: subInfo.gifterDisplayName,
                totalGiftCount: subInfo.gifterGiftCount,
                isPrime: subInfo.isPrime,
                message: subInfo.message,
                months: subInfo.months,
                streak: subInfo.streak,
                tier: subInfo.plan
            });
        });

        channelChatClient.client.onWhisper((user, message, msg) => {
            eventEmitter.emit("whisper", {
                user,
                name: msg.userInfo.displayName,
                message
            });
        });

        botChatClient.client.onDisconnect((manually, reason) => {
            if (reason.message === "[1006] ") {
                // Ignore network disconnects.
                return;
            }
            if (reason) {
                Log.error("The bot's Twitch chat disconnected.", {err: reason});
            }
        });

        if (!channelChatClient.client.isConnected) {
            channelChatClient.client.connect();
        }

        if (!botChatClient.client.isConnected) {
            botChatClient.client.connect();
        }
    }

    //               #                ###         #      ##         #
    //               #                #  #        #     #  #        #
    //  ###    ##   ###   #  #  ###   #  #  #  #  ###    #    #  #  ###
    // ##     # ##   #    #  #  #  #  ###   #  #  #  #    #   #  #  #  #
    //   ##   ##     #    #  #  #  #  #     #  #  #  #  #  #  #  #  #  #
    // ###     ##     ##   ###  ###   #      ###  ###    ##    ###  ###
    //                          #
    /**
     * Sets up the Twitch PubSub subscriptions.
     * @returns {void}
     */
    static setupPubSub() {
        pubsub = new PubSub();

        pubsub.setup(channelTwitchClient._authProvider);

        pubsub.client.onBits(process.env.TWITCH_CHANNEL_USERID, async (message) => {
            const displayName = message.userId ? (await channelTwitchClient.users.getUserById(message.userId)).displayName : "";

            eventEmitter.emit("bits", {
                userId: message.userId,
                user: message.userName,
                name: displayName,
                bits: message.bits,
                totalBits: message.totalBits,
                message: message.message,
                isAnonymous: message.isAnonymous
            });
        });

        pubsub.client.onRedemption(process.env.TWITCH_CHANNEL_USERID, (message) => {
            eventEmitter.emit("redemption", {
                userId: message.userId,
                user: message.userName,
                name: message.userDisplayName,
                message: message.message,
                date: message.redemptionDate,
                cost: message.rewardCost,
                reward: message.rewardTitle,
                isQueued: message.rewardIsQueued
            });
        });
    }
}

module.exports = Twitch;
