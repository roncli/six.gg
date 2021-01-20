const Log = require("../logging/log"),
    IoRedis = require("ioredis");

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
    // ##                 #
    //  #
    //  #     ##    ###  ##    ###
    //  #    #  #  #  #   #    #  #
    //  #    #  #   ##    #    #  #
    // ###    ##   #     ###   #  #
    //              ###
    /**
     * Logs in to the Redis server, and returns the client.
     * @returns {Promise<IoRedis.Redis>} A promise that returns the Redis client.
     */
    static async login() {
        /** @type {IoRedis.Redis} */
        let client;

        try {
            const newClient = new IoRedis({
                host: "redis",
                port: +process.env.REDIS_PORT,
                password: process.env.REDIS_PASSWORD
            });
            client = newClient;
        } catch (err) {
            Log.exception("A Redis error occurred while logging in.", err);

            client.removeAllListeners();
            if (client) {
                await client.quit();
            }
            client = void 0;

            return void 0;
        }

        client.on("error", async (err) => {
            Log.exception("A Redis error occurred.", err);

            client.removeAllListeners();
            if (client) {
                await client.quit();
            }
            client = void 0;
        });

        return client;
    }
}

module.exports = Redis;
