// MARK: class Encoding
/**
 * A class of encoding functions.
 */
class Encoding {
    static #attributeEncodeParse = /"/g;
    static #discordEncodeMentionCharactersParse = /(?<character>[@#])/gm;
    static #discordEncodeSpecialCharactersParse = /(?<character>[*_~`>])/gm;
    static #htmlEncodeAmpersandParse = /&/gm;
    static #htmlEncodeLessThanParse = /</gm;
    static #htmlEncodeUnicodeParse = /[\u0080-\uFFFF]/gm;
    static #jsEncodeParse = /"/gm;

    // MARK: static attributeEncode
    /**
     * Attribute-encodes a string.
     * @param {string} str The string.
     * @returns {string} The encoded string.
     */
    static attributeEncode(str) {
        return str && `${str}`.replace(Encoding.#attributeEncodeParse, "&#34;") || "";
    }

    // MARK: static discordEncode
    /**
     * Discord-encodes a string.
     * @param {string} str The string.
     * @returns {string} The encoded string.
     */
    static discordEncode(str) {
        return str && `${str}`.replace(Encoding.#discordEncodeSpecialCharactersParse, (match, p1) => `\\${p1}`).replace(Encoding.#discordEncodeMentionCharactersParse, (match, p1) => `\\${p1} `) || "";
    }

    // MARK: static htmlEncode
    /**
     * HTML-encodes a string.
     * @param {string} str The string.
     * @returns {string} The encoded string.
     */
    static htmlEncode(str) {
        return str && `${str}`.replace(Encoding.#htmlEncodeAmpersandParse, "&amp;").replace(Encoding.#htmlEncodeLessThanParse, "&lt;").replace(Encoding.#htmlEncodeUnicodeParse, (i) => `&#${i.charCodeAt(0)};`) || "";
    }

    // MARK: static jsEncode
    /**
     * Javascript-encodes a string.
     * @param {string} str The string.
     * @returns {string} The encoded string.
     */
    static jsEncode(str) {
        return str && `${str}`.replace(Encoding.#jsEncodeParse, "\\\"") || "";
    }
}

if (typeof module === "undefined") {
    window.Encoding = Encoding;
} else {
    module.exports = Encoding;
}
