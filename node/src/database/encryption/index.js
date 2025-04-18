/**
 * @typedef {import("../../../types/node/encryptionTypes").EncryptedData} EncryptionTypes.EncryptedData
 */

const crypto = require("crypto");

// MARK: class Encryption
/**
 * Encryption library.  Based loosely on https://stackoverflow.com/a/53573115/214137.
 */
class Encryption {
    /** @type {crypto.CipherGCMTypes} */
    static #algorithm = "aes-256-gcm";
    static #authenticationTagLength = 16;
    static #initVectorLength = 12;
    static #keyLength = 32;
    static #saltLength = 16;

    // MARK: static #getKey
    /**
     * Gets the encryption key.
     * @returns {Buffer} The buffer containing the encryption key.
     */
    static #getKey() {
        return Buffer.from(process.env.ENCRYPTION_KEY, "hex");
    }

    // MARK: static #getSalt
    /**
     * Gets a random salt to help prevent rainbow table attacks.
     * @returns {Buffer} The buffer containing the salt.
     */
    static #getSalt() {
        return crypto.randomBytes(Encryption.#saltLength);
    }

    // MARK: static #getSaltedKey
    /**
     * Salts the key to generate a new salted key.
     * @param {Uint8Array} salt The salt.
     * @returns {Buffer} The key.
     */
    static #getSaltedKey(salt) {
        return crypto.scryptSync(Encryption.#getKey(), salt, Encryption.#keyLength);
    }

    // MARK: static decryptWithSalt
    /**
     * Decrypts the data with a salted key.
     * @param {EncryptionTypes.EncryptedData} encryptedData The encrypted data to be decrypted.
     * @returns {string} The decrypted text.
     */
    static decryptWithSalt(encryptedData) {
        const key = Encryption.#getSaltedKey(encryptedData.salt),
            authenticationTag = encryptedData.encrypted.slice(-16),
            initVector = encryptedData.encrypted.slice(0, 12),
            encryptedMessage = encryptedData.encrypted.slice(12, -16),
            decipher = crypto.createDecipheriv(Encryption.#algorithm, key, initVector, {authTagLength: Encryption.#authenticationTagLength});

        decipher.setAuthTag(authenticationTag);

        const messagetext = decipher.update(encryptedMessage);

        return Buffer.concat([messagetext, decipher.final()]).toString("utf-8");
    }

    // MARK: static encryptWithSalt
    /**
     * Encrypts the text with a salted key.
     * @param {string} messagetext The clear text message to be encrypted.
     * @returns {EncryptionTypes.EncryptedData} The encrypted data.
     */
    static encryptWithSalt(messagetext) {
        const salt = Encryption.#getSalt(),
            key = Encryption.#getSaltedKey(salt),
            initVector = crypto.randomBytes(Encryption.#initVectorLength),
            cipher = crypto.createCipheriv(Encryption.#algorithm, key, initVector, {authTagLength: Encryption.#authenticationTagLength});

        let encryptedMessage = cipher.update(messagetext, "utf8");

        encryptedMessage = Buffer.concat([encryptedMessage, cipher.final()]);

        return {salt, encrypted: Buffer.concat([initVector, encryptedMessage, cipher.getAuthTag()])};
    }
}

module.exports = Encryption;
