const Discord = require("../index"),
    DiscordJs = require("discord.js");

//  #   #          ##
//  #   #           #
//  #   #   ###     #    # ##
//  #####  #   #    #    ##  #
//  #   #  #####    #    ##  #
//  #   #  #        #    # ##
//  #   #   ###    ###   #
//                       #
//                       #
/**
 * A command that returns a URL containing information about using the bot.
 */
class Help {
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
        return new DiscordJs.SlashCommandBuilder()
            .setName("help")
            .setDescription("Provides a URL to get help with the bot.");
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

        await interaction.editReply({
            content: `${member}, see the about page https://${process.env.DOMAIN}/about.`
        });
        return true;
    }
}

module.exports = Help;
