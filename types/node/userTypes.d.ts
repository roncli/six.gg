import MongoDb from "mongodb"

declare namespace UserTypes {
    type UserData = {
        _id?: number
        discord: {
            id: string
            username: string
            discriminator?: string
            avatar?: string
        }
        guildMember: {
            nick?: string
            joinedAt: Date
        }
        connections?: {
            name: string
            id: string
            type: string
        }[]
        location?: string
        timezone?: string
    }

    type UserMongoData = {
        _id: MongoDb.Long
        discord: {
            id: string
            username: string
            discriminator?: string
            avatar?: string
        }
        guildMember: {
            nick?: string
            joinedAt: Date
        }
        connections: {
            name: string
            id: string
            type: string
        }[]
        location?: string
        timezone: string
    }
}

export = UserTypes
