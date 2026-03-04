import EncryptionTypes from "./encryptionTypes"

declare namespace TwitchTypes {
    type EncryptedMongoTokens = {
        botAccessToken: EncryptionTypes.EncryptedMongoData
        botRefreshToken: EncryptionTypes.EncryptedMongoData
        channelAccessToken: EncryptionTypes.EncryptedMongoData
        channelRefreshToken: EncryptionTypes.EncryptedMongoData
    }

    type EncryptedTokens = {
        botAccessToken: EncryptionTypes.EncryptedData
        botRefreshToken: EncryptionTypes.EncryptedData
        channelAccessToken: EncryptionTypes.EncryptedData
        channelRefreshToken: EncryptionTypes.EncryptedData
    }

    type Tokens = {
        botAccessToken: string
        botRefreshToken: string
        channelAccessToken: string
        channelRefreshToken: string
    }
}

export = TwitchTypes;
