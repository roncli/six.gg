import MongoDb from "mongodb"

declare namespace EncryptionTypes {
    type EncryptedData = {
        salt: Uint8Array
        encrypted: Uint8Array
    }

    type EncryptedMongoData = {
        salt: MongoDb.Binary
        encrypted: MongoDb.Binary
    }
}

export = EncryptionTypes
