const Discord = require("../index"),
    DiscordJs = require("discord.js"),
    Exception = require("../../errors/exception"),
    Warning = require("../../errors/warning");

/**
 * @type {typeof import("../../listeners/discord")}
 */
let DiscordListener;

setTimeout(() => {
    DiscordListener = require("../../listeners/discord");
}, 0);

// MARK: class Limit
/**
 * A command that limits the maximum number of users in a voice channel.
 */
class Limit {
    // MARK: static builder
    /**
     * The common command builder.
     * @param {DiscordJs.SlashCommandBuilder | DiscordJs.SlashCommandSubcommandBuilder} builder The command builder.
     * @returns {void}
     */
    static builder(builder) {
        builder
            .addIntegerOption((option) => option
                .setName("limit")
                .setDescription("The maximum number of users in the voice channel.  Use 0 for no limit.")
                .setRequired(true)
                .setMinValue(0)
                .setMaxValue(99))
            .setName("limit")
            .setDescription("Limits the number of users in your most recently-created voice channel.");
    }

    // MARK: static command
    /**
     * The command data.
     * @returns {DiscordJs.SlashCommandBuilder} The command data.
     */
    static command() {
        const builder = new DiscordJs.SlashCommandBuilder();
        Limit.builder(builder);
        return builder;
    }

    // MARK: static async handle
    /**
     * The command handler.
     * @param {DiscordJs.ChatInputCommandInteraction} interaction The interaction.
     * @param {DiscordJs.User} user The user initiating the interaction.
     * @returns {Promise<boolean>} A promise that returns whether the interaction was successfully handled.
     */
    static async handle(interaction, user) {
        await interaction.deferReply({ephemeral: true});

        const limit = interaction.options.getInteger("limit", true),
            member = Discord.findGuildMemberById(user.id);

        const createdChannel = await DiscordListener.voiceChannelManagement.getCreatedChannel(member);
        if (!createdChannel) {
            await interaction.editReply({
                embeds: [
                    Discord.embedBuilder({
                        description: `Sorry, ${member}, but I don't see a channel you've created recently.  You can create a new channel with \`/addchannel\`.`,
                        color: 0xff0000
                    })
                ]
            });
            throw new Warning("No channel found.");
        }

        try {
            await createdChannel.setUserLimit(limit);
        } catch (err) {
            await interaction.editReply({
                embeds: [
                    Discord.embedBuilder({
                        description: `Sorry, ${member}, but something broke.  Try later, or get a hold of @roncli for fixing.`,
                        color: 0xff0000
                    })
                ]
            });
            throw new Exception("There was a Discord error while attempting to limit a voice channel.", err);
        }

        await interaction.editReply({
            embeds: [
                Discord.embedBuilder({
                    description: "Voice channel limit changed successfully."
                })
            ]
        });

        if (limit === 0) {
            await interaction.followUp({
                embeds: [
                    Discord.embedBuilder({
                        title: "Voice Channel Limit Lifted",
                        description: `${createdChannel} no longer has a channel limit.`
                    })
                ],
                ephemeral: false
            });
        } else {
            await interaction.followUp({
                embeds: [
                    Discord.embedBuilder({
                        title: "Voice Channel Limit Applied",
                        description: `${createdChannel} is now limited to a maximum of ${limit} members.`
                    })
                ],
                ephemeral: false
            });
        }

        return true;
    }

    // MARK: static simulate
    /**
     * Adds a subcommand to the simulate command.
     * @param {DiscordJs.SlashCommandBuilder} simulate The simulate command builder.
     * @returns {void}
     */
    static simulate(simulate) {
        simulate.addSubcommand((command) => {
            command
                .addUserOption((option) => option
                    .setName("from")
                    .setDescription("The user to simulate the command with.")
                    .setRequired(true));
            Limit.builder(command);
            return command;
        });
    }
}

module.exports = Limit;
