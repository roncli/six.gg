import { AttendeeMongoData } from "./attendeeTypes"
import { CountersMongoData } from "./countersTypes"
import { EventMongoData } from "./eventTypes"
import { EncryptedMongoSessionData } from "./sessionTypes"
import { EncryptedMongoTokens } from "./twitchTypes"
import { UserMongoData } from "./userTypes"
import MongoDb from "mongodb"

declare module "mongodb" {
    export interface Db {
        collection<TSchema = AttendeeMongoData>(name: "attendee", options?: CollectionOptions): Collection<TSchema>
        collection<TSchema = CountersMongoData>(name: "counters", options?: CollectionOptions): Collection<TSchema>
        collection<TSchema = EventMongoData>(name: "event", options?: CollectionOptions): Collection<TSchema>
        collection<TSchema = EncryptedMongoSessionData>(name: "session", options?: CollectionOptions): Collection<TSchema>
        collection<TSchema = EncryptedMongoTokens>(name: "twitch", options?: CollectionOptions): Collection<TSchema>
        collection<TSchema = UserMongoData>(name: "user", options?: CollectionOptions): Collection<TSchema>
    }

    // The default implementation of aggregate's generic (<T = Document>) is too restrictive, so we change it here to suit our needs.
    export interface Collection {
        aggregate<T = any>(pipeline?: MongoDb.Document[], options?: AggregateOptions): AggregationCursor<T>;
    }
}
