/**
 * @typedef {import("../../../types/browser/viewTypes").Option} ViewTypes.Option
 */

// MARK: class Options
/**
 * A class that provides options functions.
 */
class Options {
    static #Encoding = typeof module === "undefined" ? window.Encoding : require("./encoding");

    // MARK: generateOptions
    /**
     * Generates an HTML string of options.
     * @param {ViewTypes.Option[]} options The options.
     * @param {string} [selected] The selected value.
     * @param {boolean} [includeEmpty] Whether to include an empty option.
     * @returns {string} The HTML string of options.
     */
    static generateOptions(options, selected, includeEmpty) {
        return /* html */`
            ${includeEmpty ? /* html */`
                <option value=""${!selected || selected === "" ? " selected" : ""}></option>
            ` : ""}
            ${options.map((o) => /* html */`
                <option value="${Options.#Encoding.htmlEncode(o.value)}"${selected === o.value ? " selected" : ""}>${Options.#Encoding.htmlEncode(o.text || o.value)}</option>
            `).join("")}
        `;
    }
}

if (typeof module === "undefined") {
    window.Options = Options;
} else {
    module.exports = Options;
}
