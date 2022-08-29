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

//    #        #      #   ###   #                                   ##
//   # #       #      #  #   #  #                                    #
//  #   #   ## #   ## #  #      # ##    ###   # ##   # ##    ###     #
//  #   #  #  ##  #  ##  #      ##  #      #  ##  #  ##  #  #   #    #
//  #####  #   #  #   #  #      #   #   ####  #   #  #   #  #####    #
//  #   #  #  ##  #  ##  #   #  #   #  #   #  #   #  #   #  #        #
//  #   #   ## #   ## #   ###   #   #   ####  #   #  #   #   ###    ###
/**
 * A command that adds a voice channel.
 */
class AddChannel {
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
                .setName("name")
                .setDescription("The name of the channel.")
                .setRequired(true))
            .setName("addchannel")
            .setDescription("Adds a voice channel.");
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
        AddChannel.builder(builder);
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

        const name = interaction.options.getString("name", true),
            member = Discord.findGuildMemberById(user.id);

        if (!DiscordListener.voiceChannelManagement.canCreateChannel(member)) {
            await interaction.editReply({
                content: `Sorry, ${member}, but you can only create a voice channel once every five minutes.`
            });
            throw new Warning("Can only create a voice channel once every 5 minutes.");
        }

        if (Discord.findChannelByName(name)) {
            await interaction.editReply({
                content: `Sorry, ${member}, but ${name} already exists as a voice channel.`
            });
            throw new Warning("Channel already exists.");
        }

        let newChannel;
        try {
            newChannel = await DiscordListener.voiceChannelManagement.create(member, name);
        } catch (err) {
            await interaction.editReply({
                content: `Sorry, ${member}, but something broke.  Try later, or get a hold of @roncli for fixing.`
            });
            throw new Exception("There was a Discord error while attempting to create a voice channel.", err);
        }

        await interaction.editReply({
            embeds: [
                Discord.embedBuilder({
                    title: "Voice Channel Commands",
                    description: `Use these commands to further manage ${newChannel}.`,
                    fields: [
                        {
                            name: "/limit <0-99>",
                            value: "Limits the number of users who can join the channel.  Defaults to 0, which is unlimited.",
                            inline: true
                        },
                        {
                            name: "/private",
                            value: "Turns your channel into a private channel that only you can join.  You can then permit other individual users to join your channel.",
                            inline: true
                        }
                    ]
                })
            ]
        });

        await interaction.followUp({
            embeds: [
                Discord.embedBuilder({
                    title: "New Voice Channel Created",
                    description: `${newChannel}`
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
            AddChannel.builder(command);
            return command;
        });
    }
}

module.exports = AddChannel;
