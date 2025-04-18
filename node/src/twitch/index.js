/**
 * @typedef {import("@twurple/chat").ChatClient} ChatClient
 * @typedef {import("../../types/node/igdbTypes").SearchGameResult} IGDBTypes.SearchGameResult
 */

const Chat = require("./chat"),
    events = require("events"),
    EventSub = require("./eventsub"),
    Exception = require("../errors/exception"),
    IGDB = require("igdb-api-node"),
    Log = require("@roncli/node-application-insights-logger"),
    PubSub = require("./pubsub"),
    TwitchAuth = require("@twurple/auth"),
    TwitchClient = require("@twurple/api").ApiClient,
    TwitchDb = require("../database/twitch");

// MARK: class Twitch
/**
 * Handles Twitch integration.
 */
class Twitch {
    /** @type {TwitchAuth.AppTokenAuthProvider} */
    static #apiAuthProvider;

    /** @type {string} */
    static #botAccessToken;

    /** @type {TwitchAuth.RefreshingAuthProvider} */
    static #botAuthProvider;

    /** @type {string} */
    static #botRefreshToken;

    /** @type {Chat} */
    static #botChatClient;

    /** @type {TwitchClient} */
    static #botTwitchClient;

    /** @type {string} */
    static #channelAccessToken;

    /** @type {TwitchAuth.RefreshingAuthProvider} */
    static #channelAuthProvider;

    /** @type {string} */
    static #channelRefreshToken;

    /** @type {TwitchClient} */
    static #channelTwitchClient;

    /** @type {Chat} */
    static #channelChatClient;

    static #eventEmitter = new events.EventEmitter();

    /** @type {PubSub} */
    static #pubsub;

    /** @type {string} */
    static #state;

    // MARK: static get botChatClient
    /**
     * Gets the current Twitch bot chat client.
     * @returns {ChatClient} The current Twitch bot client.
     */
    static get botChatClient() {
        return Twitch.#botChatClient.client;
    }

    // MARK: static get botTwitchClient
    /**
     * Gets the current Twitch bot client.
     * @returns {TwitchClient} The current Twitch client.
     */
    static get botTwitchClient() {
        return Twitch.#botTwitchClient;
    }

    // MARK: static get channelTwitchClient
    /**
     * Gets the current channel Twitch client.
     * @returns {TwitchClient} The current Twitch client.
     */
    static get channelTwitchClient() {
        return Twitch.#channelTwitchClient;
    }

    // MARK: static get state
    /**
     * Gets the state.
     * @returns {string} The state.
     */
    static get state() {
        return Twitch.#state;
    }

    // MARK: static set state
    /**
     * Sets the state.
     * @param {string} value The state.
     */
    static set state(value) {
        Twitch.#state = value;
    }

    // MARK: static async connect
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

        Twitch.#channelAccessToken = tokens.channelAccessToken;
        Twitch.#channelRefreshToken = tokens.channelRefreshToken;
        Twitch.#botAccessToken = tokens.botAccessToken;
        Twitch.#botRefreshToken = tokens.botRefreshToken;

        if (!Twitch.#channelAccessToken || !Twitch.#channelRefreshToken || !Twitch.#botAccessToken || !Twitch.#botRefreshToken) {
            return false;
        }

        if (!Twitch.#channelAuthProvider || !Twitch.#botAuthProvider) {
            Log.verbose("Logging into Twitch...");
            try {
                await Twitch.login();
            } catch (err) {
                Log.error("Error connecting to Twitch.", {err});
            }

            Log.verbose("Connected to Twitch.");
        }

        return !!(Twitch.#channelAuthProvider && Twitch.#botAuthProvider);
    }

    // MARK: static get events
    /**
     * Returns the EventEmitter for Twitch events.
     * @returns {events.EventEmitter} The EventEmitter object.
     */
    static get events() {
        return Twitch.#eventEmitter;
    }

    // MARK: static async login
    /**
     * Logs in to Twitch and creates the Twitch client.
     * @returns {Promise} A promise that resolves when login is complete.
     */
    static async login() {
        Twitch.#channelAuthProvider = new TwitchAuth.RefreshingAuthProvider({
            clientId: process.env.TWITCH_CLIENTID,
            clientSecret: process.env.TWITCH_CLIENTSECRET
        });

        Twitch.#channelAuthProvider.onRefresh(async (userId, token) => {
            Twitch.#channelAccessToken = token.accessToken;
            Twitch.#channelRefreshToken = token.refreshToken;
            try {
                await TwitchDb.set({
                    botAccessToken: Twitch.#botAccessToken,
                    botRefreshToken: Twitch.#botRefreshToken,
                    channelAccessToken: Twitch.#channelAccessToken,
                    channelRefreshToken: Twitch.#channelRefreshToken
                });
            } catch (err) {
                throw new Exception("There was an error setting the Twitch tokens on refreshing the channel tokens.", err);
            }
        });

        await Twitch.#channelAuthProvider.addUserForToken({
            accessToken: Twitch.#channelAccessToken,
            refreshToken: Twitch.#channelRefreshToken,
            expiresIn: void 0,
            obtainmentTimestamp: void 0,
            scope: process.env.TWITCH_CHANNEL_SCOPES.split(" ")
        }, ["chat"]);

        Twitch.#botAuthProvider = new TwitchAuth.RefreshingAuthProvider({
            clientId: process.env.TWITCH_CLIENTID,
            clientSecret: process.env.TWITCH_CLIENTSECRET
        });

        Twitch.#botAuthProvider.onRefresh(async (userId, token) => {
            Twitch.#botAccessToken = token.accessToken;
            Twitch.#botRefreshToken = token.refreshToken;
            try {
                await TwitchDb.set({
                    botAccessToken: Twitch.#botAccessToken,
                    botRefreshToken: Twitch.#botRefreshToken,
                    channelAccessToken: Twitch.#channelAccessToken,
                    channelRefreshToken: Twitch.#channelRefreshToken
                });
            } catch (err) {
                throw new Exception("There was an error setting the Twitch tokens on refreshing the bot tokens.", err);
            }
        });

        await Twitch.#botAuthProvider.addUserForToken({
            accessToken: Twitch.#botAccessToken,
            refreshToken: Twitch.#botRefreshToken,
            expiresIn: void 0,
            obtainmentTimestamp: void 0,
            scope: process.env.TWITCH_BOT_SCOPES.split(" ")
        }, ["chat"]);

        await Twitch.#channelAuthProvider.refreshAccessTokenForUser(process.env.TWITCH_CHANNEL_USERID);
        await Twitch.#botAuthProvider.refreshAccessTokenForUser(process.env.TWITCH_BOT_USERID);

        Twitch.#channelTwitchClient = new TwitchClient({
            authProvider: Twitch.#channelAuthProvider,
            logger: {
                colors: false
            }
        });

        Twitch.#channelTwitchClient.requestScopesForUser(process.env.TWITCH_CHANNEL_USERID, process.env.TWITCH_CHANNEL_SCOPES.split(" "));

        Twitch.#botTwitchClient = new TwitchClient({
            authProvider: Twitch.#botAuthProvider,
            logger: {
                colors: false
            }
        });

        Twitch.#botTwitchClient.requestScopesForUser(process.env.TWITCH_BOT_USERID, process.env.TWITCH_BOT_SCOPES.split(" "));

        Twitch.#apiAuthProvider = new TwitchAuth.AppTokenAuthProvider(process.env.TWITCH_CLIENTID, process.env.TWITCH_CLIENTSECRET);

        await Twitch.setupChat();
        await Twitch.setupPubSub();
    }

    // MARK: static async logout
    /**
     * Logs out of Twitch.
     * @returns {Promise} A promise that resolves when the logout is complete.
     */
    static async logout() {
        try {
            await Twitch.#channelChatClient.client.quit();
        } catch {}
        Twitch.#channelChatClient = void 0;

        try {
            await Twitch.#botChatClient.client.quit();
        } catch {}
        Twitch.#botChatClient = void 0;
    }

    // MARK: static async refreshTokens
    /**
     * Refreshes Twitch tokens.
     * @returns {Promise} A promsie that resolves when the tokens are refreshed.
     */
    static async refreshTokens() {
        try {
            await Twitch.#channelAuthProvider.refreshAccessTokenForUser(process.env.TWITCH_CHANNEL_USERID);
            await Twitch.#botAuthProvider.refreshAccessTokenForUser(process.env.TWITCH_BOT_USERID);
        } catch (err) {
            Twitch.#eventEmitter.emit("error", {
                message: "Error refreshing twitch client tokens.",
                err
            });
        }

        await Twitch.logout();
        await Twitch.connect();
        await Twitch.login();
    }

    // MARK: static async searchGameList
    /**
     * Searches IGDB for a game.
     * @param {string} search The game to search for.
     * @returns {Promise<IGDBTypes.SearchGameResult[]>} A promise that returns the game from IGDB.
     */
    static async searchGameList(search) {
        const client = IGDB.default(Twitch.#apiAuthProvider.clientId, (await Twitch.#apiAuthProvider.getAppAccessToken()).accessToken),
            res = await client.where(`name ~ "${search.replace(/"/g, "\\\"")}"*`).fields(["id", "name", "cover.url"]).limit(50).request("/games");

        return res.data;
    }

    // MARK: static async setStreamInfo
    /**
     * Sets the stream's title and game.
     * @param {string} title The title of the stream.
     * @param {string} game The game.
     * @returns {Promise} A promise that resolves when the stream's info has been set.
     */
    static async setStreamInfo(title, game) {
        let gameId;
        try {
            const gameData = await Twitch.#channelTwitchClient.games.getGameByName(game);

            gameId = gameData.id;
        } catch {}

        await Twitch.#channelTwitchClient.channels.updateChannelInfo(process.env.TWITCH_CHANNEL_USERID, {title, gameId});
    }

    // MARK: static async setupEventSub
    /**
     * Sets up the Twitch EventSub.
     * @returns {Promise} A promise that resolves when the EventSub is setup.
     */
    static async setupEventSub() {
        await EventSub.client.onChannelFollow(process.env.TWITCH_CHANNEL_USERID, process.env.TWITCH_CHANNEL_USERID, async (follow) => {
            Twitch.#eventEmitter.emit("follow", {
                userId: follow.userId,
                user: (await follow.getUser()).name,
                name: follow.userDisplayName,
                date: follow.followDate
            });
        });

        await EventSub.client.onStreamOnline(process.env.TWITCH_CHANNEL_USERID, async (data) => {
            const stream = await data.getStream();

            Twitch.#eventEmitter.emit("stream", {
                title: stream.title,
                game: stream.gameName,
                id: stream.id,
                startDate: stream.startDate,
                thumbnailUrl: stream.thumbnailUrl
            });
        });

        await EventSub.client.onStreamOffline(process.env.TWITCH_CHANNEL_USERID, () => {
            Twitch.#eventEmitter.emit("offline");
        });
    }

    // MARK: static async setupChat
    /**
     * Sets up the Twitch chat.
     * @returns {Promise} A promise that resolves when the Twitch chat is setup.
     */
    static async setupChat() {
        if (Twitch.#channelChatClient && Twitch.#channelChatClient.client) {
            try {
                await Twitch.#channelChatClient.client.quit();
            } catch {} finally {}
        }
        Twitch.#channelChatClient = new Chat(Twitch.#channelAuthProvider);

        if (Twitch.#botChatClient && Twitch.#botChatClient.client) {
            try {
                await Twitch.#botChatClient.client.quit();
            } catch {} finally {}
        }

        Twitch.#botChatClient = new Chat(Twitch.#botAuthProvider);

        Twitch.#channelChatClient.client.onAction((channel, user, message, msg) => {
            Twitch.#eventEmitter.emit("action", {
                channel: channel.charAt(0) === "#" ? channel.substring(1) : channel,
                user,
                name: msg.userInfo.displayName,
                message
            });
        });

        Twitch.#channelChatClient.client.onCommunityPayForward((channel, user, forwardInfo) => {
            Twitch.#eventEmitter.emit("subGiftCommunityPayForward", {
                channel: channel.charAt(0) === "#" ? channel.substring(1) : channel,
                user,
                name: forwardInfo.displayName,
                originalGifter: forwardInfo.originalGifterDisplayName
            });
        });

        Twitch.#channelChatClient.client.onCommunitySub((channel, user, subInfo) => {
            Twitch.#eventEmitter.emit("subGiftCommunity", {
                channel: channel.charAt(0) === "#" ? channel.substring(1) : channel,
                user,
                name: subInfo.gifterDisplayName,
                giftCount: subInfo.count,
                totalGiftCount: subInfo.gifterGiftCount,
                tier: subInfo.plan
            });
        });

        Twitch.#channelChatClient.client.onDisconnect((manually, reason) => {
            if (!reason || reason.message === "[1006] ") {
                // Ignore network disconnects, or disconnects without a reason.
                return;
            }
            if (reason) {
                Log.error("The streamer's Twitch chat disconnected.", {err: reason});
            }
        });

        Twitch.#channelChatClient.client.onGiftPaidUpgrade((channel, user, subInfo) => {
            Twitch.#eventEmitter.emit("subGiftUpgrade", {
                channel: channel.charAt(0) === "#" ? channel.substring(1) : channel,
                user,
                name: subInfo.displayName,
                gifter: subInfo.gifterDisplayName,
                tier: "Upgraded"
            });
        });

        Twitch.#channelChatClient.client.onMessage((channel, user, message, msg) => {
            Twitch.#eventEmitter.emit("message", {
                channel: channel.charAt(0) === "#" ? channel.substring(1) : channel,
                user,
                name: msg.userInfo.displayName,
                message,
                msg
            });
        });

        Twitch.#channelChatClient.client.onPrimeCommunityGift((channel, user, subInfo) => {
            Twitch.#eventEmitter.emit("giftPrime", {
                channel: channel.charAt(0) === "#" ? channel.substring(1) : channel,
                user: subInfo.gifter,
                name: subInfo.gifterDisplayName,
                gift: subInfo.name
            });
        });

        Twitch.#channelChatClient.client.onPrimePaidUpgrade((channel, user, subInfo) => {
            Twitch.#eventEmitter.emit("subPrimeUpgraded", {
                channel: channel.charAt(0) === "#" ? channel.substring(1) : channel,
                user,
                name: subInfo.displayName,
                tier: subInfo.plan
            });
        });

        Twitch.#channelChatClient.client.onRaid((channel, user, raidInfo) => {
            Twitch.#eventEmitter.emit("raided", {
                channel: channel.charAt(0) === "#" ? channel.substring(1) : channel,
                user,
                name: raidInfo.displayName,
                viewerCount: raidInfo.viewerCount
            });
        });

        Twitch.#channelChatClient.client.onResub((channel, user, subInfo) => {
            Twitch.#eventEmitter.emit("resub", {
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

        Twitch.#channelChatClient.client.onRitual((channel, user, ritualInfo, msg) => {
            Twitch.#eventEmitter.emit("ritual", {
                channel: channel.charAt(0) === "#" ? channel.substring(1) : channel,
                user,
                name: msg.userInfo.displayName,
                message: ritualInfo.message,
                ritual: ritualInfo.ritualName
            });
        });

        Twitch.#channelChatClient.client.onStandardPayForward((channel, user, forwardInfo) => {
            Twitch.#eventEmitter.emit("subGiftPayForward", {
                channel: channel.charAt(0) === "#" ? channel.substring(1) : channel,
                user,
                name: forwardInfo.displayName,
                originalGifter: forwardInfo.originalGifterDisplayName,
                recipient: forwardInfo.recipientDisplayName
            });
        });

        Twitch.#channelChatClient.client.onSub((channel, user, subInfo) => {
            Twitch.#eventEmitter.emit("sub", {
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

        Twitch.#channelChatClient.client.onSubExtend((channel, user, subInfo) => {
            Twitch.#eventEmitter.emit("subExtend", {
                channel: channel.charAt(0) === "#" ? channel.substring(1) : channel,
                user,
                displayName: subInfo.displayName,
                months: subInfo.months,
                tier: subInfo.plan
            });
        });

        Twitch.#channelChatClient.client.onSubGift((channel, user, subInfo) => {
            Twitch.#eventEmitter.emit("subGift", {
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

        Twitch.#channelChatClient.client.onWhisper((user, message, msg) => {
            Twitch.#eventEmitter.emit("whisper", {
                user,
                name: msg.userInfo.displayName,
                message
            });
        });

        Twitch.#botChatClient.client.onDisconnect((manually, reason) => {
            if (!reason || reason.message === "[1006] ") {
                // Ignore network disconnects, or disconnects without a reason.
                return;
            }
            if (reason) {
                Log.error("The bot's Twitch chat disconnected.", {err: reason});
            }
        });

        if (!Twitch.#channelChatClient.client.isConnected) {
            Twitch.#channelChatClient.client.connect();
        }

        if (!Twitch.#botChatClient.client.isConnected) {
            Twitch.#botChatClient.client.connect();
        }
    }

    // MARK: static setupPubSub
    /**
     * Sets up the Twitch PubSub subscriptions.
     * @returns {void}
     */
    static setupPubSub() {
        Twitch.#pubsub = new PubSub();

        Twitch.#pubsub.setup(Twitch.#channelTwitchClient._authProvider);

        Twitch.#pubsub.client.onBits(process.env.TWITCH_CHANNEL_USERID, async (message) => {
            const displayName = message.userId ? (await Twitch.#channelTwitchClient.users.getUserById(message.userId)).displayName : "";

            Twitch.#eventEmitter.emit("bits", {
                userId: message.userId,
                user: message.userName,
                name: displayName,
                bits: message.bits,
                totalBits: message.totalBits,
                message: message.message,
                isAnonymous: message.isAnonymous
            });
        });

        Twitch.#pubsub.client.onRedemption(process.env.TWITCH_CHANNEL_USERID, (message) => {
            Twitch.#eventEmitter.emit("redemption", {
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
