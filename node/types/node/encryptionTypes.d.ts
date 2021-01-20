import MongoDb from "mongodb"

declare namespace EncryptionTypes {
    type EncryptedData = {
        salt: Buffer
        encrypted: Buffer
    }

    type EncryptedMongoData = {
        salt: MongoDb.Binary
        encrypted: MongoDb.Binary
    }
}

export = EncryptionTypes
