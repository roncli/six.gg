// MARK: class Exception
/**
 * An error class that can include an inner error.
 */
class Exception extends Error {
    // MARK: constructor
    /**
     * A constructor that creates the exception.
     * @param {string} message The message of the exception.
     * @param {Error} err The error object to include.
     */
    constructor(message, err) {
        super(message);

        this.innerError = err;
    }

    // MARK: get stack
    /**
     * Return the inner error's stack.
     * @returns {string} The inner error's stack.
     */
    get stack() {
        if (!this.innerError) {
            return super.stack;
        }
        return this.innerError.stack;
    }

    // MARK: get message
    /**
     * Return this error's and the inner error's message.
     * @returns {string} The error message.
     */
    get message() {
        if (!this.innerError) {
            return super.message;
        }
        return `${super.message} - ${this.innerError.message}`;
    }
}

module.exports = Exception;
