const Attendee = require("../../models/attendee"),
    Discord = require("../index"),
    DiscordJs = require("discord.js"),
    Encoding = require("../../../public/js/common/encoding"),
    Event = require("../../models/event"),
    User = require("../../models/user"),
    Warning = require("../../errors/warning");

// MARK: class Leave
/**
 * A command that allows the user to leave an event.
 */
class Leave {
    // MARK: static builder
    /**
     * The common command builder.
     * @param {DiscordJs.SlashCommandBuilder | DiscordJs.SlashCommandSubcommandBuilder} builder The command builder.
     * @returns {void}
     */
    static builder(builder) {
        builder
            .addIntegerOption((option) => option
                .setName("eventid")
                .setDescription("The event ID to leave.")
                .setRequired(true))
            .setName("leave")
            .setDescription("Leave an event you no longer wish to attend.");
    }

    // MARK: static command
    /**
     * The command data.
     * @returns {DiscordJs.SlashCommandBuilder} The command data.
     */
    static command() {
        const builder = new DiscordJs.SlashCommandBuilder();
        Leave.builder(builder);
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

        const eventId = interaction.options.getInteger("eventid", true),
            member = Discord.findGuildMemberById(user.id);

        let sixUser, event;
        try {
            sixUser = await User.getByGuildMember(member);
            event = await Event.get(eventId);
        } catch (err) {
            await interaction.editReply({
                embeds: [
                    Discord.embedBuilder({
                        description: `Sorry, ${member}, but something broke.  Try later, or get a hold of @roncli for fixing.`,
                        color: 0xff0000
                    })
                ]
            });
            throw err;
        }

        if (!event) {
            await interaction.editReply({
                embeds: [
                    Discord.embedBuilder({
                        description: `Sorry, ${member}, but that is an invalid event ID.`,
                        color: 0xff0000
                    })
                ]
            });
            throw new Warning("Invalid event ID.");
        }

        try {
            await Attendee.remove(eventId, sixUser.id);
        } catch (err) {
            await interaction.editReply({
                embeds: [
                    Discord.embedBuilder({
                        description: `Sorry, ${member}, but something broke.  Try later, or get a hold of @roncli for fixing.`,
                        color: 0xff0000
                    })
                ]
            });
            throw err;
        }

        await interaction.editReply({
            embeds: [
                Discord.embedBuilder({
                    description: `${member}, you are no longer scheduled to attend the event **${Encoding.discordEncode(event.title)}**.`
                })
            ]
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
            Leave.builder(command);
            return command;
        });
    }
}

module.exports = Leave;
