const Attendee = require("../../models/attendee"),
    Discord = require("../index"),
    DiscordJs = require("discord.js"),
    Encoding = require("../../../public/js/common/encoding"),
    Event = require("../../models/event"),
    User = require("../../models/user"),
    Warning = require("../../errors/warning");

//    ###           #
//      #
//      #   ###    ##    # ##
//      #  #   #    #    ##  #
//      #  #   #    #    #   #
//  #   #  #   #    #    #   #
//   ###    ###    ###   #   #
/**
 * A command that allows the user to join an event.
 */
class Join {
    // #            #    ##       #
    // #                  #       #
    // ###   #  #  ##     #     ###   ##   ###
    // #  #  #  #   #     #    #  #  # ##  #  #
    // #  #  #  #   #     #    #  #  ##    #
    // ###    ###  ###   ###    ###   ##   #
    /**
     * The common command builder.
     * @param {DiscordJs.SlashCommandBuilder | DiscordJs.SlashCommandSubcommandBuilder} builder The command builder.
     * @returns {void}
     */
    static builder(builder) {
        builder
            .addStringOption((option) => option
                .setName("eventid")
                .setDescription("The event ID to join.  Get this from the #event-announcements channel.")
                .setRequired(true))
            .setName("join")
            .setDescription("Join an event you wish to attend.");
    }

    //                                        #
    //                                        #
    //  ##    ##   # #   # #    ###  ###    ###
    // #     #  #  ####  ####  #  #  #  #  #  #
    // #     #  #  #  #  #  #  # ##  #  #  #  #
    //  ##    ##   #  #  #  #   # #  #  #   ###
    /**
     * The command data.
     * @returns {DiscordJs.SlashCommandBuilder} The command data.
     */
    static command() {
        const builder = new DiscordJs.SlashCommandBuilder();
        Join.builder(builder);
        return builder;
    }

    // #                    #  ##
    // #                    #   #
    // ###    ###  ###    ###   #     ##
    // #  #  #  #  #  #  #  #   #    # ##
    // #  #  # ##  #  #  #  #   #    ##
    // #  #   # #  #  #   ###  ###    ##
    /**
     * The command handler.
     * @param {DiscordJs.ChatInputCommandInteraction} interaction The interaction.
     * @param {DiscordJs.User} user The user initiating the interaction.
     * @returns {Promise<boolean>} A promise that returns whether the interaction was successfully handled.
     */
    static async handle(interaction, user) {
        await interaction.deferReply();

        const eventId = interaction.options.getInteger("eventid", true),
            member = Discord.findGuildMemberById(user.id);

        let sixUser, event;
        try {
            sixUser = await User.getByGuildMember(member);
            event = await Event.get(eventId);
        } catch (err) {
            await interaction.reply({
                content: `Sorry, ${member}, but something broke.  Try later, or get a hold of @roncli for fixing.`,
                ephemeral: true
            });
            throw err;
        }

        if (!event) {
            await interaction.reply({
                content: `Sorry, ${member}, but that is an invalid event ID.`,
                ephemeral: true
            });
            throw new Warning("Invalid event ID.");
        }

        try {
            await Attendee.add(eventId, sixUser.id);
        } catch (err) {
            await interaction.reply({
                content: `Sorry, ${member}, but something broke.  Try later, or get a hold of @roncli for fixing.`,
                ephemeral: true
            });
            throw err;
        }

        await interaction.reply({
            embeds: [
                Discord.embedBuilder({
                    title: "Event Joined",
                    description: `${member}, you are now scheduled to attend the event **${Encoding.discordEncode(event.title)}**.  You will receive a reminder 30 minutes before the event begins.`,
                    fields: [
                        {
                            name: "Event Start Time",
                            value: `<t:${Math.floor(event.start.getTime() / 1000)}:F>`,
                            inline: true
                        },
                        {
                            name: `/leave ${eventId}`,
                            value: "Use this command to leave the event.",
                            inline: true
                        }
                    ]
                })
            ],
            ephemeral: true
        });

        return true;
    }

    //         #                ##           #
    //                           #           #
    //  ###   ##    # #   #  #   #     ###  ###    ##
    // ##      #    ####  #  #   #    #  #   #    # ##
    //   ##    #    #  #  #  #   #    # ##   #    ##
    // ###    ###   #  #   ###  ###    # #    ##   ##
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
                    .setDescription("The user to simulate the command with."));
            Join.builder(command);
            return command;
        });
    }
}

module.exports = Join;
