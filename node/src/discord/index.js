const DiscordJs = require("discord.js"),
    events = require("events"),
    fs = require("fs/promises"),
    Log = require("@roncli/node-application-insights-logger"),
    Notify = require("../notify"),
    path = require("path"),
    Rest = require("@discordjs/rest"),
    util = require("util");

// MARK: class Discord
/**
 * A static class that handles all Discord.js interctions.
 */
class Discord {
    static #discord = new DiscordJs.Client({
        intents: [
            DiscordJs.GatewayIntentBits.DirectMessages,
            DiscordJs.GatewayIntentBits.Guilds,
            DiscordJs.GatewayIntentBits.GuildMembers,
            DiscordJs.GatewayIntentBits.GuildPresences,
            DiscordJs.GatewayIntentBits.GuildVoiceStates
        ],
        rest: {
            retries: 999999999
        }
    });

    static #eventEmitter = new events.EventEmitter();

    /** @type {DiscordJs.Guild} */
    static #guild;

    static #readied = false;

    /** @type {DiscordJs.Role} */
    static #theEvilOverlordRole;

    // MARK: static get channels
    /**
     * Returns the channels on the server.
     * @returns {DiscordJs.Collection<string, DiscordJs.GuildChannel | DiscordJs.ThreadChannel>} The channels.
     */
    static get channels() {
        if (Discord.#guild) {
            return Discord.#guild.channels.cache;
        }

        return new DiscordJs.Collection();
    }

    // MARK: static get members
    /**
     * Returns the members on the server.
     * @returns {DiscordJs.Collection<string, DiscordJs.GuildMember>} The members.
     */
    static get members() {
        if (Discord.#guild) {
            return Discord.#guild.members.cache.filter((m) => !m.user.bot);
        }

        return new DiscordJs.Collection();
    }

    // MARK: static get events
    /**
     * Returns the EventEmitter for Discord events.
     * @returns {events.EventEmitter} The EventEmitter object.
     */
    static get events() {
        return Discord.#eventEmitter;
    }

    // MARK: static get icon
    /**
     * Returns the guild's icon.
     * @returns {string} The URL of the icon.
     */
    static get icon() {
        if (Discord.#discord && Discord.#discord.ws && Discord.#discord.ws.status === 0) {
            return Discord.#discord.user.displayAvatarURL();
        }

        return void 0;
    }

    // MARK: static get id
    /**
     * Returns the server ID.
     * @returns {string} The ID of the server.
     */
    static get id() {
        if (Discord.#guild) {
            return Discord.#guild.id;
        }

        return void 0;
    }

    // MARK: static startup
    /**
     * Sets up Discord events.  Should only ever be called once.
     * @returns {void}
     */
    static startup() {
        Discord.#discord.on("clientReady", async () => {
            Log.verbose("Connected to Discord.");

            Discord.#guild = Discord.#discord.guilds.cache.find((g) => g.name === process.env.DISCORD_GUILD);

            Discord.#theEvilOverlordRole = Discord.#guild.roles.cache.find((r) => r.name === "The Evil Overlord");

            const files = await fs.readdir(path.join(__dirname, "commands")),
                simulate = new DiscordJs.SlashCommandBuilder(),
                commands = [];

            simulate
                .setName("simulate")
                .setDescription("Simulates a command from another user.");

            for (const file of files) {
                const commandFile = require(`./commands/${file}`);

                /** @type {DiscordJs.SlashCommandBuilder} */
                const command = commandFile.command();

                commands.push(command);

                if (commandFile.simulate) {
                    commandFile.simulate(simulate);
                }
            }

            simulate.setDefaultMemberPermissions(0);

            commands.push(simulate);

            try {
                const rest = new Rest.REST().setToken(process.env.DISCORD_TOKEN);

                await rest.put(DiscordJs.Routes.applicationGuildCommands(process.env.DISCORD_CLIENTID, Discord.#guild.id), {body: commands});
            } catch (err) {
                Log.error("Error adding slash commands.", {err});
            }

            Discord.#eventEmitter.emit("ready");

            if (!Discord.#readied) {
                Discord.#readied = true;
            }

            Notify.setupNotifications();
        });

        Discord.#discord.on("disconnect", (ev) => {
            Log.error("Disconnected from Discord.", {err: ev instanceof Error ? ev : new Error(util.inspect(ev))});
        });

        Discord.#discord.on("interactionCreate", (interaction) => {
            Discord.#eventEmitter.emit("interactionCreate", interaction);
        });

        Discord.#discord.on("presenceUpdate", (oldPresence, newPresence) => {
            Discord.#eventEmitter.emit("presenceUpdate", oldPresence, newPresence);
        });

        Discord.#discord.on("voiceStateUpdate", (oldState, newState) => {
            Discord.#eventEmitter.emit("voiceStateUpdate", oldState, newState);
        });

        Discord.#discord.on("error", (err) => {
            if (err.message === "read ECONNRESET") {
                // Swallow this error, see https://github.com/discordjs/discord.js/issues/3043#issuecomment-465543902
                return;
            }

            Log.error("Discord error.", {err});
        });
    }

    // MARK: static async connect
    /**
     * Connects to Discord.
     * @returns {Promise<void>}
     */
    static async connect() {
        Log.verbose("Connecting to Discord...");

        try {
            await Discord.#discord.login();
        } catch (err) {
            Log.error("Error connecting to Discord, will automatically retry.", {err});
        }
    }

    // MARK: static isConnected
    /**
     * Determines whether the bot is connected to Discord.
     * @returns {boolean} Whether the bot is connected to Discord.
     */
    static isConnected() {
        return Discord.#discord && Discord.#discord.ws && Discord.#guild ? Discord.#discord.ws.status === 0 : false;
    }

    // MARK: static async queue
    /**
     * Queues a message to be sent.
     * @param {string} message The message to be sent.
     * @param {DiscordJs.TextChannel|DiscordJs.DMChannel|DiscordJs.GuildMember} channel The channel to send the message to.
     * @returns {Promise<DiscordJs.Message>} A promise that returns the sent message.
     */
    static async queue(message, channel) {
        if (channel.id === Discord.#discord.user.id) {
            return void 0;
        }

        let msg;
        try {
            msg = await Discord.richQueue(Discord.embedBuilder({description: message}), channel);
        } catch {}
        return msg;
    }

    // MARK: static async edit
    /**
     * Edits a message.
     * @param {DiscordJs.Message} message The posted message to edit.
     * @param {string} text The text to change the posted message to.
     * @returns {Promise<void>}
     */
    static async edit(message, text) {
        await Discord.richEdit(message, new DiscordJs.EmbedBuilder({description: text}));
    }

    // MARK: static embedBuilder
    /**
     * Gets a new DiscordJs EmbedBuilder object.
     * @param {DiscordJs.EmbedData} [options] The options to pass.
     * @returns {DiscordJs.EmbedBuilder} The EmbedBuilder object.
     */
    static embedBuilder(options) {
        const embed = new DiscordJs.EmbedBuilder(options);

        embed.setFooter({text: embed.data && embed.data.footer ? embed.data.footer.text : "Six Gaming", iconURL: Discord.icon});

        if (!embed.data || !embed.data.color) {
            embed.setColor(0x16f6f8);
        }

        if (!embed.data || !embed.data.timestamp) {
            embed.setTimestamp(new Date());
        }

        return embed;
    }

    // MARK: static async richQueue
    /**
     * Queues a rich embed message to be sent.
     * @param {DiscordJs.EmbedBuilder} embed The message to be sent.
     * @param {DiscordJs.TextChannel|DiscordJs.DMChannel|DiscordJs.GuildMember} channel The channel to send the message to.
     * @returns {Promise<DiscordJs.Message>} A promise that returns the sent message.
     */
    static async richQueue(embed, channel) {
        if (channel.id === Discord.#discord.user.id) {
            return void 0;
        }

        if (embed && embed.data && embed.data.fields) {
            embed.data.fields.forEach((field) => {
                if (field.value && field.value.length > 1024) {
                    field.value = field.value.substring(0, 1024);
                }
            });
        }

        let msg;
        try {
            const msgSend = await channel.send({embeds: [embed]});

            if (msgSend instanceof Array) {
                msg = msgSend[0];
            } else {
                msg = msgSend;
            }
        } catch {}
        return msg;
    }

    // MARK: static async richEdit
    /**
     * Edits a rich embed message.
     * @param {DiscordJs.Message} message The posted message to edit.
     * @param {DiscordJs.EmbedBuilder} embed The message to change the posted message to.
     * @returns {Promise<void>}
     */
    static async richEdit(message, embed) {
        embed.setFooter({text: embed.data && embed.data.footer ? embed.data.footer.text : "Six Gaming", iconURL: Discord.icon});

        if (embed && embed.data && embed.data.fields) {
            embed.data.fields.forEach((field) => {
                if (field.value && field.value.length > 1024) {
                    field.value = field.value.substring(0, 1024);
                }
            });
        }

        embed.data.color = message.embeds[0].color;

        if (!embed.data || !embed.data.timestamp) {
            embed.setTimestamp(new Date());
        }

        await message.edit({embeds: [embed]});
    }

    // MARK: static createChannel
    /**
     * Creates a new channel on the Discord server.
     * @param {string} name The name of the channel.
     * @param {DiscordJs.ChannelType.GuildCategory | DiscordJs.ChannelType.GuildText | DiscordJs.ChannelType.GuildVoice} type The type of channel to create.
     * @param {DiscordJs.PermissionOverwrites[]|DiscordJs.ChannelCreationOverwrites[]} [overwrites] The permissions that should overwrite the default permission set.
     * @param {string} [reason] The reason the channel is being created.
     * @returns {Promise<DiscordJs.TextChannel | DiscordJs.NewsChannel | DiscordJs.VoiceChannel | DiscordJs.CategoryChannel | DiscordJs.StageChannel>} The created channel.
     */
    static createChannel(name, type, overwrites, reason) {
        if (!Discord.#guild) {
            return void 0;
        }
        return Discord.#guild.channels.create({name, type, permissionOverwrites: overwrites, reason});
    }

    // MARK: static createRole
    /**
     * Creates a new role on the Discord server.
     * @param {DiscordJs.RoleCreateOptions} [data] The role data.
     * @returns {Promise<DiscordJs.Role>} A promise that returns the created role.
     */
    static createRole(data) {
        if (!Discord.#guild) {
            return void 0;
        }
        return Discord.#guild.roles.create(data);
    }

    // MARK: static findCategoryByName
    /**
     * Finds a Discord category by its name.
     * @param {string} name The name of the category.
     * @returns {DiscordJs.CategoryChannel} The Discord category.
     */
    static findCategoryByName(name) {
        if (!Discord.#guild) {
            return void 0;
        }
        return /** @type {DiscordJs.CategoryChannel} */(Discord.#guild.channels.cache.find((c) => c.name === name && c.type === DiscordJs.ChannelType.GuildCategory)); // eslint-disable-line @stylistic/no-extra-parens
    }

    // MARK: static findChannelById
    /**
     * Finds a Discord channel by its ID.
     * @param {string} id The ID of the channel.
     * @returns {DiscordJs.GuildChannel | DiscordJs.ThreadChannel} The Discord channel.
     */
    static findChannelById(id) {
        if (!Discord.#guild) {
            return void 0;
        }
        return Discord.#guild.channels.cache.find((c) => c.id === id);
    }

    // MARK: static findChannelByName
    /**
     * Finds a Discord channel by its name.
     * @param {string} name The name of the channel.
     * @returns {DiscordJs.GuildChannel | DiscordJs.ThreadChannel} The Discord channel.
     */
    static findChannelByName(name) {
        if (!Discord.#guild) {
            return void 0;
        }
        return Discord.#guild.channels.cache.find((c) => c.name === name);
    }

    // MARK: static findGuildMemberByDisplayName
    /**
     * Returns the Discord user in the guild by their display name.
     * @param {string} displayName The display name of the Discord user.
     * @returns {DiscordJs.GuildMember} The guild member.
     */
    static findGuildMemberByDisplayName(displayName) {
        if (!Discord.#guild) {
            return void 0;
        }
        return Discord.#guild.members.cache.find((m) => m.displayName === displayName);
    }

    // MARK: static findGuildMemberById
    /**
     * Returns the Discord user in the guild by their Discord ID.
     * @param {string} id The ID of the Discord user.
     * @returns {DiscordJs.GuildMember} The guild member.
     */
    static findGuildMemberById(id) {
        if (!Discord.#guild) {
            return void 0;
        }
        return Discord.#guild.members.cache.find((m) => m.id === id);
    }

    // MARK: static findRoleById
    /**
     * Finds a Discord role by its ID.
     * @param {string} id The ID of the role.
     * @returns {DiscordJs.Role} The Discord role.
     */
    static findRoleById(id) {
        if (!Discord.#guild) {
            return void 0;
        }
        return Discord.#guild.roles.cache.find((r) => r.id === id);
    }

    // MARK: static findRoleByName
    /**
     * Finds a Discord role by its name.
     * @param {string} name The name of the role.
     * @returns {DiscordJs.Role} The Discord role.
     */
    static findRoleByName(name) {
        if (!Discord.#guild) {
            return void 0;
        }
        return Discord.#guild.roles.cache.find((r) => r.name === name);
    }

    // MARK: static findTextChannelByName
    /**
     * Finds a Discord text channel by its name.
     * @param {string} name The name of the channel.
     * @returns {DiscordJs.TextChannel} The Discord text channel.
     */
    static findTextChannelByName(name) {
        if (!Discord.#guild) {
            return void 0;
        }
        return /** @type {DiscordJs.TextChannel} */(Discord.#guild.channels.cache.find((c) => c.name === name && c.type === DiscordJs.ChannelType.GuildText)); // eslint-disable-line @stylistic/no-extra-parens
    }

    // MARK: static findUserById
    /**
     * Finds a Discord user by user ID.
     * @param {string} id The user ID.
     * @returns {Promise<DiscordJs.User>} A promise that returns the user.
     */
    static findUserById(id) {
        return Discord.#discord.users.fetch(id, {cache: false});
    }

    // MARK: static findVoiceChannelByName
    /**
     * Finds a Discord voice channel by its name.
     * @param {string} name The name of the channel.
     * @returns {DiscordJs.VoiceChannel} The Discord voice channel.
     */
    static findVoiceChannelByName(name) {
        if (!Discord.#guild) {
            return void 0;
        }
        return /** @type {DiscordJs.VoiceChannel} */(Discord.#guild.channels.cache.find((c) => c.name === name && c.type === DiscordJs.ChannelType.GuildVoice)); // eslint-disable-line @stylistic/no-extra-parens
    }

    // MARK: static getName
    /**
     * Returns the user's display name if they are a guild member, or a username if they are a user.
     * @param {DiscordJs.GuildMember|DiscordJs.User} user The user to get the name for.
     * @returns {string} The name of the user.
     */
    static getName(user) {
        return user instanceof DiscordJs.GuildMember ? user.displayName : user.username;
    }

    // MARK: static isOwner
    /**
     * Determines whether the user is the owner.
     * @param {DiscordJs.GuildMember} member The user to check.
     * @returns {boolean} Whether the user is the owner.
     */
    static isOwner(member) {
        return !!(member && Discord.#theEvilOverlordRole.members.find((m) => m.id === member.id));
    }
}

module.exports = Discord;
