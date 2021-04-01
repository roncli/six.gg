import DiscordJs from "discord.js"
import Event from "../../src/models/event"
import User from "../../src/models/user"

declare namespace ViewTypes {
    type CalendarViewParameters = {
        timezone: string
        defaultTimezone: boolean
    }

    type EventViewParameters = {
        event: Event
        user: User
        eventUser: User
        guildMember: DiscordJs.GuildMember
        attendees: {
            user: User
            guildMember: DiscordJs.GuildMember
        }[]
    }

    type HomeViewParameters = {
        streamers: {
            member: DiscordJs.GuildMember
            activity: DiscordJs.Activity
        }[]
        timezone: string
        defaultTimezone: boolean
    }

    type IndexViewParameters = {
        head: string
        html: string
        host: string
        originalUrl: string
        year: number
        version: string
        user: User
        guildMember: DiscordJs.GuildMember
    }

    type MeViewParameters = {
        user: User
        guildMember: DiscordJs.GuildMember
        timezones: {
            zone: string
            time: string
        }[]
    }

    type MemberViewParameters = {
        user: User
        guildMember: DiscordJs.GuildMember
    }

    type MembersViewParameters = {
        user: User
        guildMember: DiscordJs.GuildMember
    }[]

    type Option = {
        text?: string
        value: string
    }
}

export = ViewTypes
