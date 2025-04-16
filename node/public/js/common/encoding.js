// MARK: class Encoding
/**
 * A class of encoding functions.
 */
class Encoding {
    // MARK: static attributeEncode
    /**
     * Attribute-encodes a string.
     * @param {string} str The string.
     * @returns {string} The encoded string.
     */
    static attributeEncode(str) {
        return str && `${str}`.replace(/"/g, "&#34;") || "";
    }

    // MARK: static discordEncode
    /**
     * Discord-encodes a string.
     * @param {string} str The string.
     * @returns {string} The encoded string.
     */
    static discordEncode(str) {
        return str && `${str}`.replace(/(?<character>[*_~`>])/gm, (match, p1) => `\\${p1}`).replace(/(?<character>[@#])/gm, (match, p1) => `\\${p1} `) || "";
    }

    // MARK: static htmlEncode
    /**
     * HTML-encodes a string.
     * @param {string} str The string.
     * @returns {string} The encoded string.
     */
    static htmlEncode(str) {
        return str && `${str}`.replace(/&/gm, "&amp;").replace(/</gm, "&lt;").replace(/[\u0080-\uFFFF]/gm, (i) => `&#${i.charCodeAt(0)};`) || "";
    }

    // MARK: static jsEncode
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
