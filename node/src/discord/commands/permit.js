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

// MARK: class Permit
/**
 * A command that permits a user into a private voice channel.
 */
class Permit {
    // MARK: static builder
    /**
     * The common command builder.
     * @param {DiscordJs.SlashCommandBuilder | DiscordJs.SlashCommandSubcommandBuilder} builder The command builder.
     * @returns {void}
     */
    static builder(builder) {
        builder
            .addUserOption((option) => option
                .setName("user")
                .setDescription("The user to allow in your private voice channel.")
                .setRequired(true))
            .setName("permit")
            .setDescription("Permits a user to join your most recently-created private voice channel.");
    }

    // MARK: static command
    /**
     * The command data.
     * @returns {DiscordJs.SlashCommandBuilder} The command data.
     */
    static command() {
        const builder = new DiscordJs.SlashCommandBuilder();
        Permit.builder(builder);
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

        const permitUser = interaction.options.getUser("user", true),
            member = Discord.findGuildMemberById(user.id);

        const permitMember = Discord.findGuildMemberById(permitUser.id);

        if (!member) {
            await interaction.editReply({
                embeds: [
                    Discord.embedBuilder({
                        description: `Sorry, ${member}, but I can't find a member by that name on this server.`,
                        color: 0xff0000
                    })
                ]
            });
            throw new Warning("Member not on the server.");
        }

        const createdChannel = DiscordListener.voiceChannelManagement.getCreatedChannel(member);
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
            await createdChannel.permissionOverwrites.create(permitMember, {Connect: true});
        } catch (err) {
            await interaction.editReply({
                embeds: [
                    Discord.embedBuilder({
                        description: `Sorry, ${member}, but something broke.  Try later, or get a hold of @roncli for fixing.`,
                        color: 0xff0000
                    })
                ]
            });
            throw new Exception("There was a Discord error while attempting to permit a user to a voice channel.", err);
        }

        await interaction.editReply({
            embeds: [
                Discord.embedBuilder({
                    description: "Voice channel permissions applied successfully."
                })
            ]
        });

        await interaction.followUp({
            embeds: [
                Discord.embedBuilder({
                    title: "Voice Channel Permissions",
                    description: `${permitMember} is now permitted to join ${createdChannel}.`
                })
            ],
            ephemeral: false
        });

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
            Permit.builder(command);
            return command;
        });
    }

}

module.exports = Permit;
