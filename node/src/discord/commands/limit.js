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

//  #        #             #     #
//  #                            #
//  #       ##    ## #    ##    ####
//  #        #    # # #    #     #
//  #        #    # # #    #     #
//  #        #    # # #    #     #  #
//  #####   ###   #   #   ###     ##
/**
 * A command that limits the maximum number of users in a voice channel.
 */
class Limit {
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
            .addIntegerOption((option) => option
                .setName("limit")
                .setDescription("The maximum number of users in the voice channel.  Use 0 for no limit.")
                .setRequired(true)
                .setMinValue(0)
                .setMaxValue(99))
            .setName("limit")
            .setDescription("Limits the number of users in your most recently-created voice channel.");
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
        Limit.builder(builder);
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

        const limit = interaction.options.getInteger("limit", true),
            member = Discord.findGuildMemberById(user.id);

        const createdChannel = await DiscordListener.voiceChannelManagement.getCreatedChannel(member);
        if (!createdChannel) {
            await interaction.reply({
                content: `Sorry, ${member}, but I don't see a channel you've created recently.  You can create a new channel with \`/addchannel\`.`,
                ephemeral: true
            });
            throw new Warning("No channel found.");
        }

        try {
            await createdChannel.setUserLimit(limit);
        } catch (err) {
            await interaction.reply({
                content: `Sorry, ${member}, but something broke.  Try later, or get a hold of @roncli for fixing.`,
                ephemeral: true
            });
            throw new Exception("There was a Discord error while attempting to limit a voice channel.", err);
        }

        if (limit === 0) {
            await interaction.reply({
                embeds: [
                    Discord.embedBuilder({
                        title: "Channel Limit Lifted",
                        description: `${createdChannel} no longer has a channel limit.`
                    })
                ]
            });
        } else {
            await interaction.reply({
                embeds: [
                    Discord.embedBuilder({
                        title: "Channel Limit Applied",
                        description: `${createdChannel} is now limited to a maximum of ${limit} members.`
                    })
                ]
            });
        }

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
            Limit.builder(command);
            return command;
        });
    }
}

module.exports = Limit;
