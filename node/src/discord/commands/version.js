const Discord = require("../index"),
    DiscordJs = require("discord.js"),
    pjson = require("../../../package.json");

//  #   #                         #
//  #   #
//  #   #   ###   # ##    ###    ##     ###   # ##
//   # #   #   #  ##  #  #        #    #   #  ##  #
//   # #   #####  #       ###     #    #   #  #   #
//   # #   #      #          #    #    #   #  #   #
//    #     ###   #      ####    ###    ###   #   #
/**
 * A command that returns the version of the bot.
 */
class Version {
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
            .setName("version")
            .setDescription("Provides the version number and development information about the bot.");
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
                    description: `Six Gaming.  Messy but effective.  By roncli, Version ${pjson.version}.  Project is open source, visit https://github.com/roncli/six.gg.`
                })
            ]
        });
        return true;
    }
}

module.exports = Version;
