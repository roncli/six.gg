const Discord = require("../index"),
    DiscordJs = require("discord.js");

//  #   #         #               #     #
//  #   #         #                     #
//  #   #   ###   # ##    ###    ##    ####    ###
//  # # #  #   #  ##  #  #        #     #     #   #
//  # # #  #####  #   #   ###     #     #     #####
//  ## ##  #      ##  #      #    #     #  #  #
//  #   #   ###   # ##   ####    ###     ##    ###
/**
 * A command that returns website URL.
 */
class Website {
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
            .setName("website")
            .setDescription("Provides a link to Six Gaming's website.");
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
     * @returns {Promise<boolean>} A promise that returns whether the interaction was successfully handled.
     */
    static async handle(interaction) {
        await interaction.deferReply({ephemeral: true});
        await interaction.editReply({
            embeds: [
                Discord.embedBuilder({
                    description: `We have a website?  Yes!  Visit our website at https://${process.env.DOMAIN} for more about Six Gaming!`
                })
            ]
        });
        return true;
    }
}

module.exports = Website;
