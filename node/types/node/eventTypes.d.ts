import MongoDb from "mongodb"

declare namespace EventTypes {
    type EventData = {
        _id?: number
        title: string
        start: Date
        end: Date
        userId: number
        game?: string
        gameId?: number
        description?: string
    }

    type EventMongoData = {
        _id: MongoDb.Long
        title: string
        start: Date
        end: Date
        userId: MongoDb.Long
        game?: string
        gameId?: MongoDb.Long
        description?: string
    }
}

export = EventTypes
