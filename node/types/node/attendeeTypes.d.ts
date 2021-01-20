import MongoDb from "mongodb"

declare namespace AttendeeTypes {
    type AttendeeData = {
        _id?: string
        eventId: number
        userId: number
    }

    type AttendeeMongoData = {
        _id: MongoDb.ObjectId
        eventId: MongoDb.Long
        userId: MongoDb.Long
    }
}

export = AttendeeTypes
