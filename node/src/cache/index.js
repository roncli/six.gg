const lruCache = require("lru-cache");

// MARK: class Cache
/**
 * A class for caching data using lru-cache.
 */
class Cache {
    static #cache = new lruCache.LRUCache({
        max: 500,
        allowStale: false,
        updateAgeOnGet: true
    });

    // MARK: static get
    /**
     * Gets a cache item.
     * @param {string} key The key to get the cache item for.
     * @returns {object|undefined} The cache item.
     */
    static get(key) {
        return this.#cache.get(key);
    }

    // MARK: static invalidate
    /**
     * Invalidates cache items.
     * @param {string[]} invalidators The keys to invalidate.
     * @returns {void}
     */
    static invalidate(invalidators) {
        for (const invalidator of invalidators) {
            const list = /** @type {string[]} */(this.#cache.get(invalidator)) || []; // eslint-disable-line @stylistic/no-extra-parens
            for (const key of list) {
                this.#cache.delete(key);
            }
        }
    }

    // MARK: static set
    /**
     * Sets a cache item.
     * @param {string} key The key to set the cache item for.
     * @param {object} value The cache item.
     * @param {number} ttl The time to live for the cache item.
     * @param {string[]} [invalidators] The invalidation keys for the cache item.
     * @returns {void}
     */
    static set(key, value, ttl, invalidators) {
        this.#cache.set(key, value, {ttl});
        if (invalidators) {
            for (const invalidator of invalidators) {
                const list = /** @type {string[]} */(this.#cache.get(invalidator)) || []; // eslint-disable-line @stylistic/no-extra-parens
                list.push(key);
                this.#cache.set(invalidator, list);
            }
        }
    }
}

module.exports = Cache;
