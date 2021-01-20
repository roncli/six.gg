/**
 * @typedef {import("../../../types/browser/viewTypes").Option} ViewTypes.Option
 */

//   ###           #       #
//  #   #          #
//  #   #  # ##   ####    ##     ###   # ##    ###
//  #   #  ##  #   #       #    #   #  ##  #  #
//  #   #  ##  #   #       #    #   #  #   #   ###
//  #   #  # ##    #  #    #    #   #  #   #      #
//   ###   #        ##    ###    ###   #   #  ####
//         #
//         #
/**
 * A class that provides options functions.
 */
class Options {
    //                                      #           ##          #     #
    //                                      #          #  #         #
    //  ###   ##   ###    ##   ###    ###  ###    ##   #  #  ###   ###   ##     ##   ###    ###
    // #  #  # ##  #  #  # ##  #  #  #  #   #    # ##  #  #  #  #   #     #    #  #  #  #  ##
    //  ##   ##    #  #  ##    #     # ##   #    ##    #  #  #  #   #     #    #  #  #  #    ##
    // #      ##   #  #   ##   #      # #    ##   ##    ##   ###     ##  ###    ##   #  #  ###
    //  ###                                                  #
    /**
     * Generates an HTML string of options.
     * @param {ViewTypes.Option[]} options The options.
     * @param {string} [selected] The selected value.
     * @param {boolean} [includeEmpty] Whether to include an empty option.
     * @returns {string} The HTML string of options.
     */
    generateOptions(options, selected, includeEmpty) {
        return /* html */`
            ${includeEmpty ? /* html */`
                <option value=""${!selected || selected === "" ? " selected" : ""}></option>
            ` : ""}
            ${options.map((o) => /* html */`
                <option value="${Options.encoding.htmlEncode(o.value)}"${selected === o.value ? " selected" : ""}>${Options.encoding.htmlEncode(o.text || o.value)}</option>
            `).join("")}
        `;
    }
}

/** @type {import("./encoding")} */
// @ts-ignore
Options.encoding = new (typeof Encoding === "undefined" ? require("./encoding") : Encoding)(); // eslint-disable-line no-undef

if (typeof module === "undefined") {
    window.Options = Options;
} else {
    module.exports = Options; // eslint-disable-line no-undef
}
