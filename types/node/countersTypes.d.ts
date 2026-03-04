import MongoDb from "mongodb"

declare namespace CountersTypes {
    type CountersData = {
        _id?: string
        value: number
    }

    type CountersMongoData = {
        _id: string
        value: MongoDb.Long
    }
}

export = CountersTypes
