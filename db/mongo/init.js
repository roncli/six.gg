// Get databases.
const admin = db.getSiblingDB("admin");
const sixgg = db.getSiblingDB("sixgg");

// Set profiling to minimum level.
admin.setProfilingLevel(0);
sixgg.setProfilingLevel(0);

// Create web user for access.
admin.createUser({
    user: "web_sixgg",
    pwd: WEB_SIXGG_PASSWORD,
    roles: [{
        role: "readWrite",
        db: "sixgg"
    }],
    mechanisms: ["SCRAM-SHA-256"]
});

// Create Twitch collection.
sixgg.createCollection("twitch", {
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

// Create user collection.
sixgg.createCollection("user", {
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

sixgg.user.createIndex({"discord.id": 1}, {unique: true});

// Create session collection.
sixgg.createCollection("session", {
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
                    bsonType: "string",
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

sixgg.createCollection("event", {
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

sixgg.createCollection("attendee", {
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

// Create counters collection.
sixgg.createCollection("counters", {
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

sixgg.counters.insert([
    {_id: "user", value: NumberLong(0)},
    {_id: "event", value: NumberLong(0)}
]);
