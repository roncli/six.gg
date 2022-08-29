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

//  ####            #                   #
//  #   #                               #
//  #   #  # ##    ##    #   #   ###   ####    ###
//  ####   ##  #    #    #   #      #   #     #   #
//  #      #        #     # #    ####   #     #####
//  #      #        #     # #   #   #   #  #  #
//  #      #       ###     #     ####    ##    ###
/**
 * A command to make a voice channel private.
 */
class Private {
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
            .setName("private")
            .setDescription("Sets your most recently-created voice channel to be private.");
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
        Private.builder(builder);
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
        await interaction.deferReply({ephemeral: true});

        const member = Discord.findGuildMemberById(user.id);

        const createdChannel = await DiscordListener.voiceChannelManagement.getCreatedChannel(member);
        if (!createdChannel) {
            await interaction.editReply({
                content: `Sorry, ${member}, but I don't see a channel you've created recently.  You can create a new channel with \`/addchannel\`.`
            });
            throw new Warning("No channel found.");
        }

        try {
            await createdChannel.permissionOverwrites.create(Discord.id, {Connect: false});
            await createdChannel.permissionOverwrites.create(member, {Connect: true});
        } catch (err) {
            await interaction.editReply({
                content: `Sorry, ${member}, but something broke.  Try later, or get a hold of @roncli for fixing.`
            });
            throw new Exception("There was a Discord error while attempting to make a voice channel private.", err);
        }

        await interaction.editReply({
            embeds: [
                Discord.embedBuilder({
                    title: "Private Voice Channel Commands",
                    description: `Use these additional commands to further manage ${createdChannel}.`,
                    fields: [
                        {
                            name: "/permit <user>",
                            value: "Permits a user to join the channel."
                        }
                    ]
                })
            ]
        });

        await interaction.followUp({
            embeds: [
                Discord.embedBuilder({
                    title: "Channel Private",
                    description: `${createdChannel} is now a private channel.`
                })
            ],
            ephemeral: false
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
                    .setDescription("The user to simulate the command with.")
                    .setRequired(true));
            Private.builder(command);
            return command;
        });
    }
}

module.exports = Private;
