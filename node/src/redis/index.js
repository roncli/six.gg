const Log = require("../logging/log"),
    GenericPool = require("generic-pool"),
    IoRedis = require("ioredis");

/** @type {GenericPool.Pool<IoRedis.Redis>} */
let pool;

//  ####              #    #
//  #   #             #
//  #   #   ###    ## #   ##     ###
//  ####   #   #  #  ##    #    #
//  # #    #####  #   #    #     ###
//  #  #   #      #  ##    #        #
//  #   #   ###    ## #   ###   ####
/**
 * A class that handles calls to Redis.
 */
class Redis {
    //                   ##
    //                    #
    // ###    ##    ##    #
    // #  #  #  #  #  #   #
    // #  #  #  #  #  #   #
    // ###    ##    ##   ###
    // #
    /**
     * Gets the pool to get a Redis client.
     * @returns {GenericPool.Pool<IoRedis.Redis>} A promise that returns the Redis client.
     */
    static get pool() {
        if (!pool) {
            pool = GenericPool.createPool({
                create: () => {
                    /** @type {IoRedis.Redis} */
                    let client;

                    try {
                        client = new IoRedis({
                            host: "redis",
                            port: +process.env.REDIS_PORT,
                            password: process.env.REDIS_PASSWORD
                        });
                    } catch (err) {
                        if (client) {
                            client.removeAllListeners().disconnect();
                        }
                        return Promise.reject(err);
                    }

                    return new Promise((res, rej) => {
                        client.on("ready", () => {
                            res(client);
                        });

                        client.on("error", (err) => {
                            if (client) {
                                client.removeAllListeners().disconnect();
                            }

                            rej(err);
                        });
                    });
                },
                destroy: (client) => Promise.resolve(client.removeAllListeners().disconnect()),
                validate: (client) => Promise.resolve(client.status === "ready")
            }, {
                max: 50,
                min: 0,
                autostart: true,
                testOnBorrow: true,
                testOnReturn: true,
                idleTimeoutMillis: 300000
            });

            pool.on("factoryCreateError", (err) => {
                Log.exception("There was an error creating a Redis object from the pool.", err);
            });

            pool.on("factoryDestroyError", (err) => {
                Log.exception("There was an error destroying a Redis object in the pool.", err);
            });
        }

        return pool;
    }
}

module.exports = Redis;
