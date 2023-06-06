/**
 * @typedef {import("../../../types/node/encryptionTypes").EncryptedData} EncryptionTypes.EncryptedData
 */

const crypto = require("crypto"),

    algorithm = "aes-256-gcm",
    authenticationTagLength = 16,
    initVectorLength = 12,
    keyLength = 32,
    saltLength = 16;

//              #    #  #
//              #    # #
//  ###   ##   ###   ##     ##   #  #
// #  #  # ##   #    ##    # ##  #  #
//  ##   ##     #    # #   ##     # #
// #      ##     ##  #  #   ##     #
//  ###                           #
/**
 * Gets the encryption key.
 * @returns {Buffer} The buffer containing the encryption key.
 */
const getKey = () => Buffer.from(process.env.ENCRYPTION_KEY, "hex");

//  #####                                      #       #
//  #                                          #
//  #      # ##    ###   # ##   #   #  # ##   ####    ##     ###   # ##
//  ####   ##  #  #   #  ##  #  #   #  ##  #   #       #    #   #  ##  #
//  #      #   #  #      #      #  ##  ##  #   #       #    #   #  #   #
//  #      #   #  #   #  #       ## #  # ##    #  #    #    #   #  #   #
//  #####  #   #   ###   #          #  #        ##    ###    ###   #   #
//                              #   #  #
//                               ###   #
/**
 * Encryption library.  Based loosely on https://stackoverflow.com/a/53573115/214137.
 */
class Encryption {
    //    #                                 #
    //    #                                 #
    //  ###   ##    ##   ###   #  #  ###   ###
    // #  #  # ##  #     #  #  #  #  #  #   #
    // #  #  ##    #     #      # #  #  #   #
    //  ###   ##    ##   #       #   ###     ##
    //                          #    #
    /**
     * Decrypts the data with the associated key.
     * @param {Buffer} ciphertext - The encrypted text to be decrypted.
     * @param {Buffer} [key] The key to use.
     * @returns {string} The decrypted text.
     */
    static decrypt(ciphertext, key) {
        const authenticationTag = ciphertext.slice(-16),
            initVector = ciphertext.slice(0, 12),
            encryptedMessage = ciphertext.slice(12, -16),
            decipher = crypto.createDecipheriv(algorithm, key || getKey(), initVector, {authTagLength: authenticationTagLength});

        decipher.setAuthTag(authenticationTag);

        const messagetext = decipher.update(encryptedMessage);

        return Buffer.concat([messagetext, decipher.final()]).toString("utf-8");
    }

    //    #                                 #    #  #   #     #    #      ##         ##     #
    //    #                                 #    #  #         #    #     #  #         #     #
    //  ###   ##    ##   ###   #  #  ###   ###   #  #  ##    ###   ###    #     ###   #    ###
    // #  #  # ##  #     #  #  #  #  #  #   #    ####   #     #    #  #    #   #  #   #     #
    // #  #  ##    #     #      # #  #  #   #    ####   #     #    #  #  #  #  # ##   #     #
    //  ###   ##    ##   #       #   ###     ##  #  #  ###     ##  #  #   ##    # #  ###     ##
    //                          #    #
    /**
     * Decrypts the data with a salted key.
     * @param {EncryptionTypes.EncryptedData} encryptedData The encrypted data to be decrypted.
     * @returns {string} The decrypted text.
     */
    static decryptWithSalt(encryptedData) {
        const key = Encryption.getSaltedKey(encryptedData.salt),
            authenticationTag = encryptedData.encrypted.slice(-16),
            initVector = encryptedData.encrypted.slice(0, 12),
            encryptedMessage = encryptedData.encrypted.slice(12, -16),
            decipher = crypto.createDecipheriv(algorithm, key, initVector, {authTagLength: authenticationTagLength});

        decipher.setAuthTag(authenticationTag);

        const messagetext = decipher.update(encryptedMessage);

        return Buffer.concat([messagetext, decipher.final()]).toString("utf-8");
    }

    //                                      #
    //                                      #
    //  ##   ###    ##   ###   #  #  ###   ###
    // # ##  #  #  #     #  #  #  #  #  #   #
    // ##    #  #  #     #      # #  #  #   #
    //  ##   #  #   ##   #       #   ###     ##
    //                          #    #
    /**
     * Encrypts the text with the associated key.
     * @param {string} messagetext The clear text message to be encrypted.
     * @param {Buffer} [key] The key to use.
     * @returns {Buffer} The encrypted text.
     */
    static encrypt(messagetext, key) {
        const initVector = crypto.randomBytes(initVectorLength),
            cipher = crypto.createCipheriv(algorithm, key || getKey(), initVector, {authTagLength: authenticationTagLength});

        let encryptedMessage = cipher.update(messagetext, "utf8");

        encryptedMessage = Buffer.concat([encryptedMessage, cipher.final()]);

        return Buffer.concat([initVector, encryptedMessage, cipher.getAuthTag()]);
    }

    //                                      #    #  #   #     #    #      ##         ##     #
    //                                      #    #  #         #    #     #  #         #     #
    //  ##   ###    ##   ###   #  #  ###   ###   #  #  ##    ###   ###    #     ###   #    ###
    // # ##  #  #  #     #  #  #  #  #  #   #    ####   #     #    #  #    #   #  #   #     #
    // ##    #  #  #     #      # #  #  #   #    ####   #     #    #  #  #  #  # ##   #     #
    //  ##   #  #   ##   #       #   ###     ##  #  #  ###     ##  #  #   ##    # #  ###     ##
    //                          #    #
    /**
     * Encrypts the text with a salted key.
     * @param {string} messagetext The clear text message to be encrypted.
     * @returns {EncryptionTypes.EncryptedData} The encrypted data.
     */
    static encryptWithSalt(messagetext) {
        const salt = Encryption.getSalt(),
            key = Encryption.getSaltedKey(salt),
            initVector = crypto.randomBytes(initVectorLength),
            cipher = crypto.createCipheriv(algorithm, key, initVector, {authTagLength: authenticationTagLength});

        let encryptedMessage = cipher.update(messagetext, "utf8");

        encryptedMessage = Buffer.concat([encryptedMessage, cipher.final()]);

        return {salt, encrypted: Buffer.concat([initVector, encryptedMessage, cipher.getAuthTag()])};
    }

    //              #     ##         ##     #
    //              #    #  #         #     #
    //  ###   ##   ###    #     ###   #    ###
    // #  #  # ##   #      #   #  #   #     #
    //  ##   ##     #    #  #  # ##   #     #
    // #      ##     ##   ##    # #  ###     ##
    //  ###
    /**
     * Gets a random salt to help prevent rainbow table attacks.
     * @returns {Buffer} The buffer containing the salt.
     */
    static getSalt() {
        return crypto.randomBytes(saltLength);
    }

    //              #     ##         ##     #             #  #  #
    //              #    #  #         #     #             #  # #
    //  ###   ##   ###    #     ###   #    ###    ##    ###  ##     ##   #  #
    // #  #  # ##   #      #   #  #   #     #    # ##  #  #  ##    # ##  #  #
    //  ##   ##     #    #  #  # ##   #     #    ##    #  #  # #   ##     # #
    // #      ##     ##   ##    # #  ###     ##   ##    ###  #  #   ##     #
    //  ###                                                               #
    /**
     * Salts the key to generate a new salted key.
     * @param {Uint8Array} salt The salt.
     * @returns {Buffer} The key.
     */
    static getSaltedKey(salt) {
        return crypto.scryptSync(getKey(), salt, keyLength);
    }
}

module.exports = Encryption;
