//  #####                           #    #
//  #                               #
//  #      # ##    ###    ###    ## #   ##    # ##    ## #
//  ####   ##  #  #   #  #   #  #  ##    #    ##  #  #  #
//  #      #   #  #      #   #  #   #    #    #   #   ##
//  #      #   #  #   #  #   #  #  ##    #    #   #  #
//  #####  #   #   ###    ###    ## #   ###   #   #   ###
//                                                   #   #
//                                                    ###
/**
 * A class of encoding functions.
 */
class Encoding {
    //        #     #           #    #            #          ####                       #
    //        #     #                #            #          #                          #
    //  ###  ###   ###   ###   ##    ###   #  #  ###    ##   ###   ###    ##    ##    ###   ##
    // #  #   #     #    #  #   #    #  #  #  #   #    # ##  #     #  #  #     #  #  #  #  # ##
    // # ##   #     #    #      #    #  #  #  #   #    ##    #     #  #  #     #  #  #  #  ##
    //  # #    ##    ##  #     ###   ###    ###    ##   ##   ####  #  #   ##    ##    ###   ##
    /**
     * Attribute-encodes a string.
     * @param {string} str The string.
     * @returns {string} The encoded string.
     */
    static attributeEncode(str) {
        return str && `${str}`.replace(/"/g, "&#34;") || "";
    }

    //    #   #                                #  ####                       #
    //    #                                    #  #                          #
    //  ###  ##     ###    ##    ##   ###    ###  ###   ###    ##    ##    ###   ##
    // #  #   #    ##     #     #  #  #  #  #  #  #     #  #  #     #  #  #  #  # ##
    // #  #   #      ##   #     #  #  #     #  #  #     #  #  #     #  #  #  #  ##
    //  ###  ###   ###     ##    ##   #      ###  ####  #  #   ##    ##    ###   ##
    /**
     * Discord-encodes a string.
     * @param {string} str The string.
     * @returns {string} The encoded string.
     */
    static discordEncode(str) {
        return str && `${str}`.replace(/(?<character>[*_~`>])/gm, (match, p1) => `\\${p1}`).replace(/(?<character>[@#])/gm, (match, p1) => `\\${p1} `) || "";
    }

    // #      #          ##    ####                       #
    // #      #           #    #                          #
    // ###   ###   # #    #    ###   ###    ##    ##    ###   ##
    // #  #   #    ####   #    #     #  #  #     #  #  #  #  # ##
    // #  #   #    #  #   #    #     #  #  #     #  #  #  #  ##
    // #  #    ##  #  #  ###   ####  #  #   ##    ##    ###   ##
    /**
     * HTML-encodes a string.
     * @param {string} str The string.
     * @returns {string} The encoded string.
     */
    static htmlEncode(str) {
        return str && `${str}`.replace(/&/gm, "&amp;").replace(/</gm, "&lt;").replace(/[\u0080-\uFFFF]/gm, (i) => `&#${i.charCodeAt(0)};`) || "";
    }

    //   #          ####                       #
    //              #                          #
    //   #    ###   ###   ###    ##    ##    ###   ##
    //   #   ##     #     #  #  #     #  #  #  #  # ##
    //   #     ##   #     #  #  #     #  #  #  #  ##
    // # #   ###    ####  #  #   ##    ##    ###   ##
    //  #
    /**
     * Javascript-encodes a string.
     * @param {string} str The string.
     * @returns {string} The encoded string.
     */
    static jsEncode(str) {
        return str && `${str}`.replace(/"/gm, "\\\"") || "";
    }
}

if (typeof module === "undefined") {
    window.Encoding = Encoding;
} else {
    module.exports = Encoding; // eslint-disable-line no-undef
}
