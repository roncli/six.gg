const MongoDb = require("mongodb");

// MARK: class Db
/**
 * A class that handles setting up the database.
 */
class Db {
    static #currentMigration = 0;
    /** @type {MongoDb.MongoClient} */
    static #client;
    /** @type {MongoDb.Db} */
    static #db;

    // MARK: static fromLong
    /**
     * Converts a value from a MongoDb.Long to a number.
     * @param {MongoDb.Long|number} val The number.
     * @returns {number} The number.
     */
    static fromLong(val) {
        return typeof val === "number" ? val : val.toNumber();
    }

    // MARK: static toLong
    /**
     * Converts a value from a number to a MongoDb.Long.
     * @param {MongoDb.Long|number} val The number.
     * @returns {MongoDb.Long} The number.
     */
    static toLong(val) {
        return typeof val === "number" ? MongoDb.Long.fromNumber(val) : val;
    }

    // MARK: static async get
    /**
     * Gets the database object.
     * @returns {Promise<MongoDb.Db>} The database.
     */
    static async get() {
        if (!Db.#client) {
            Db.#client = new MongoDb.MongoClient(`mongodb+srv://web_sixgg:${process.env.WEB_SIXGG_PASSWORD}@${process.env.ATLAS_CLUSTER_URL}/${process.env.ATLAS_DATABASE_NAME}`, {
                promoteLongs: false,
                retryWrites: true,
                writeConcern: {w: "majority"},
                appName: "db-six-gg"
            });
        }

        await Db.#client.connect();
        await Db.#client.connect();

        if (!Db.#db) {
            Db.#db = Db.#client.db(process.env.ATLAS_DATABASE_NAME);
        }

        return Db.#db;
    }

    // MARK: static async id
    /**
     * Appends an ID to an object.
     * @param {object} object The object to append the ID to.
     * @param {string} collection The collection the ID belongs to.
     * @returns {Promise<void>}
     */
    static async id(object, collection) {
        if (!Db.#db) {
            await Db.get();
        }

        object._id = (await Db.#db.collection("counters").findOneAndUpdate({_id: collection}, {$inc: {value: MongoDb.Long.fromNumber(1)}})).value.add(1);
    }

    // MARK: static async startup
    /**
     * Performs operations at startup to ensure the database is ready.
     * @returns {Promise<void>}
     */
    static async startup() {
        if (!Db.#db) {
            await Db.get();
        }

        // Setup the database if it's not setup yet.
        if (!await Db.#db.listCollections().hasNext()) {
            await Db.initialize();
        }

        // Run migrations.
        if (Db.#currentMigration > 0) {
            const migrationExists = await Db.#db.listCollections({name: "migration"}).hasNext();
            if (migrationExists) {
                const migration = await Db.#db.collection("migration").findOne({}, {projection: {_id: 0, current: 1}});
                if (migration.current < Db.#currentMigration) {
                    await Db.migrations(migration.current);
                }
            } else {
                await Db.migrations(0);
            }
        }
    }

    // MARK: static async initialize
    /**
     * Initializes the database.
     * @returns {Promise<void>}
     */
    static async initialize() {
        if (!Db.#db) {
            await Db.get();
        }

        // Create Twitch collection.
        await Db.#db.createCollection("twitch", {
            validator: {
                $jsonSchema: {
                    bsonType: "object",
                    required: ["_id", "botAccessToken", "botRefreshToken", "channelAccessToken", "channelRefreshToken"],
                    additionalProperties: false,
                    properties: {
                        _id: {
                            bsonType: "objectId"
                        },
                        botAccessToken: {
                            bsonType: "object",
                            required: ["salt", "encrypted"],
                            additionalProperties: false,
                            properties: {
                                salt: {
                                    bsonType: "binData"
                                },
                                encrypted: {
                                    bsonType: "binData"
                                }
                            }
                        },
                        botRefreshToken: {
                            bsonType: "object",
                            required: ["salt", "encrypted"],
                            additionalProperties: false,
                            properties: {
                                salt: {
                                    bsonType: "binData"
                                },
                                encrypted: {
                                    bsonType: "binData"
                                }
                            }
                        },
                        channelAccessToken: {
                            bsonType: "object",
                            required: ["salt", "encrypted"],
                            additionalProperties: false,
                            properties: {
                                salt: {
                                    bsonType: "binData"
                                },
                                encrypted: {
                                    bsonType: "binData"
                                }
                            }
                        },
                        channelRefreshToken: {
                            bsonType: "object",
                            required: ["salt", "encrypted"],
                            additionalProperties: false,
                            properties: {
                                salt: {
                                    bsonType: "binData"
                                },
                                encrypted: {
                                    bsonType: "binData"
                                }
                            }
                        }
                    }
                }
            }
        });

        // Create User collection.
        await Db.#db.createCollection("user", {
            validator: {
                $jsonSchema: {
                    bsonType: "object",
                    required: ["_id", "discord", "guildMember", "connections"],
                    additionalProperties: false,
                    properties: {
                        _id: {
                            bsonType: "long"
                        },
                        discord: {
                            bsonType: "object",
                            required: ["id", "username", "discriminator"],
                            additionalProperties: false,
                            properties: {
                                id: {
                                    bsonType: "string"
                                },
                                username: {
                                    bsonType: "string"
                                },
                                discriminator: {
                                    bsonType: "string"
                                }
                            }
                        },
                        guildMember: {
                            bsonType: "object",
                            required: ["joinedAt"],
                            additionalProperties: false,
                            properties: {
                                nick: {
                                    bsonType: ["null", "string"]
                                },
                                joinedAt: {
                                    bsonType: "date"
                                }
                            }
                        },
                        connections: {
                            bsonType: "array",
                            minItems: 0,
                            uniqueItems: true,
                            additionalProperties: false,
                            items: {
                                bsonType: "object",
                                required: ["name", "type"],
                                additionalProperties: false,
                                properties: {
                                    name: {
                                        bsonType: "string"
                                    },
                                    id: {
                                        bsonType: "string"
                                    },
                                    type: {
                                        bsonType: "string"
                                    }
                                }
                            }
                        },
                        location: {
                            bsonType: "string"
                        },
                        timezone: {
                            bsonType: "string"
                        }
                    }
                }
            }
        });

        // Create unique index for user collection.
        await Db.#db.collection("user").createIndex({"discord.id": 1}, {unique: true});

        // Create Session collection.
        await Db.#db.createCollection("session", {
            validator: {
                $jsonSchema: {
                    bsonType: "object",
                    required: ["_id", "ip", "userId"],
                    additionalProperties: false,
                    properties: {
                        _id: {
                            bsonType: "objectId"
                        },
                        ip: {
                            bsonType: "string"
                        },
                        userId: {
                            bsonType: "long"
                        },
                        accessToken: {
                            bsonType: "object",
                            required: ["salt", "encrypted"],
                            additionalProperties: false,
                            properties: {
                                salt: {
                                    bsonType: "binData"
                                },
                                encrypted: {
                                    bsonType: "binData"
                                }
                            }
                        },
                        refreshToken: {
                            bsonType: "object",
                            required: ["salt", "encrypted"],
                            additionalProperties: false,
                            properties: {
                                salt: {
                                    bsonType: "binData"
                                },
                                encrypted: {
                                    bsonType: "binData"
                                }
                            }
                        },
                        expires: {
                            bsonType: "date"
                        }
                    }
                }
            }
        });

        // Create Event collection.
        await Db.#db.createCollection("event", {
            validator: {
                $jsonSchema: {
                    bsonType: "object",
                    required: ["_id", "title", "start", "end", "userId", "game"],
                    additionalProperties: false,
                    properties: {
                        _id: {
                            bsonType: "long"
                        },
                        title: {
                            bsonType: "string"
                        },
                        start: {
                            bsonType: "date"
                        },
                        end: {
                            bsonType: "date"
                        },
                        userId: {
                            bsonType: "long"
                        },
                        game: {
                            bsonType: "string"
                        },
                        gameId: {
                            bsonType: "long"
                        },
                        description: {
                            bsonType: "string"
                        }
                    }
                }
            }
        });

        // Create Attendee collection.
        await Db.#db.createCollection("attendee", {
            validator: {
                $jsonSchema: {
                    bsonType: "object",
                    required: ["_id", "eventId", "userId"],
                    additionalProperties: false,
                    properties: {
                        _id: {
                            bsonType: "objectId"
                        },
                        eventId: {
                            bsonType: "long"
                        },
                        userId: {
                            bsonType: "long"
                        }
                    }
                }
            }
        });

        // Create Counters collection.
        await Db.#db.createCollection("counters", {
            validator: {
                $jsonSchema: {
                    bsonType: "object",
                    required: ["_id", "value"],
                    additionalProperties: false,
                    properties: {
                        _id: {
                            bsonType: "string"
                        },
                        value: {
                            bsonType: "long"
                        }
                    }
                }
            }
        });

        // Insert initial values into Counters collection.
        await Db.#db.collection("counters").insertMany([
            {_id: "user", value: MongoDb.Long.fromNumber(0)},
            {_id: "event", value: MongoDb.Long.fromNumber(0)}
        ]);
    }

    // MARK: static async migrations
    /**
     * Runs any necessary migrations.
     * @param {number} current The current migration version.
     * @returns {Promise<void>}
     */
    static async migrations(current) {
        // Create Migration collection if it doesn't exist.
        const migrationExists = await Db.#db.listCollections({name: "migration"}).hasNext();
        if (!migrationExists) {
            await Db.#db.createCollection("migration", {
                validator: {
                    $jsonSchema: {
                        bsonType: "object",
                        required: ["_id", "current"],
                        additionalProperties: false,
                        properties: {
                            _id: {
                                bsonType: "objectId"
                            },
                            current: {
                                bsonType: "int"
                            }
                        }
                    }
                }
            });

            // Insert initial migration document.
            await Db.#db.collection("migration").insertOne({current: 0});
        }

        // Get the migration in the database and determine if any need to be ran.
        const migration = await Db.#db.collection("migration").findOne();
        if (migration.current < current) {
            // Loop through the migrations that need to be run and run them.
            for (let i = migration.current + 1; i <= current; i++) {
                const Migration = require(`./migrations/${i}.js`);
                await Migration.up(Db.#db);
                await Db.#db.collection("migration").findOneAndUpdate({}, {$set: {current: i}});
            }
        }
    }
}

module.exports = Db;
