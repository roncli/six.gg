import EncryptionTypes from "./encryptionTypes"
import MongoDb from "mongodb"

declare namespace SessionTypes {
    type EncryptedMongoSessionData = {
        _id: MongoDb.ObjectId
        ip: string
        userId: MongoDb.Long
        accessToken: EncryptionTypes.EncryptedMongoData
        refreshToken: EncryptionTypes.EncryptedMongoData
        expires: Date
    }

    type EncryptedSessionData = {
        _id: string
        ip: string
        userId: number
        accessToken: EncryptionTypes.EncryptedData
        refreshToken: EncryptionTypes.EncryptedData
        expires: Date
    }

    type SessionData = {
        _id?: string
        ip: string
        userId: number
        accessToken: string
        refreshToken: string
        expires: Date
    }
}

export = SessionTypes
