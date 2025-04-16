const Discord = require("../index"),
    DiscordJs = require("discord.js"),
    tzdata = require("tzdata"),
    User = require("../../models/user"),
    Warning = require("../../errors/warning");

// MARK: class Timezone
/**
 * A command that sets the user's time zone.
 */
class Timezone {
    // MARK: static builder
    /**
     * The common command builder.
     * @param {DiscordJs.SlashCommandBuilder | DiscordJs.SlashCommandSubcommandBuilder} builder The command builder.
     * @returns {void}
     */
    static builder(builder) {
        builder
            .addStringOption((option) => option
                .setName("timezone")
                .setDescription("The time zone you wish to set to.  Leave blank to clear your time zone.")
                .setRequired(false))
            .setName("timezone")
            .setDescription("Sets your time zone.");
    }

    // MARK: static command
    /**
     * The command data.
     * @returns {DiscordJs.SlashCommandBuilder} The command data.
     */
    static command() {
        const builder = new DiscordJs.SlashCommandBuilder();
        Timezone.builder(builder);
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

        const timezone = interaction.options.getString("timezone", false),
            member = Discord.findGuildMemberById(user.id);

        let sixUser;
        try {
            sixUser = await User.getByGuildMember(member);
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

        if (timezone) {
            if (!tzdata.zones[timezone]) {
                await interaction.editReply({
                    embeds: [
                        Discord.embedBuilder({
                            description: `Sorry, ${member}, but that time zone is not recognized.  Please note that this command is case sensitive.`,
                            color: 0xff0000
                        })
                    ]
                });
                throw new Warning("Invalid time zone, not in tzdata.");
            }

            let time;
            try {
                time = new Date().toLocaleString("en-US", {timeZone: timezone, hour12: true, hour: "numeric", minute: "2-digit", timeZoneName: "short"});
            } catch (err) {
                await interaction.editReply({
                    embeds: [
                        Discord.embedBuilder({
                            description: `Sorry, ${member}, but that time zone is not recognized.  Please note that this command is case sensitive.`,
                            color: 0xff0000
                        })
                    ]
                });
                throw new Warning("Invalid time zone, not recognized by toLocaleString.");
            }

            try {
                await sixUser.setTimezone(timezone);
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
                        description: `${member}, your time zone has been set to ${timezone}, where the current local time is ${time}.`
                    })
                ]
            });
            return true;
        }

        try {
            await sixUser.setTimezone();
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
                    description: `${member}, your time zone has been cleared.`
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
            Timezone.builder(command);
            return command;
        });
    }
}

module.exports = Timezone;
