import AboutView from "../../public/views/about"
import AddView from "../../public/views/calendar/add"
import Calendar from "../../public/js/calendar"
import CalendarView from "../../public/views/calendar"
import Connection from "../../public/js/common/connection"
import Encoding from "../../public/js/common/encoding"
import EventPage from "../../public/js/event"
import EventView from "../../public/views/event"
import FullCalendar from "../../node_modules/@fullcalendar/core/main"
import Home from "../../public/js/home"
import HomeView from "../../public/views/home"
import IndexView from "../../public/views/index"
import JoinView from "../../public/views/join"
import LiveView from "../../public/views/home/live"
import Me from "../../public/js/me"
import MeView from "../../public/views/me"
import MemberView from "../../public/views/member"
import MembersView from "../../public/views/members"
import MethodNotAllowedView from "../../public/views/405"
import Modal from "../../public/js/common/modal"
import NotFoundView from "../../public/views/404"
import Options from "../../public/js/common/options"
import ServerErrorView from "../../public/views/500"
import StreamersView from "../../public/views/home/streamers"
import Template from "../../public/js/common/template"
import TwitchOAuthView from "../../public/views/twitchOAuth"
import TwitchRefreshView from "../../public/views/twitchRefresh"

export {}

declare global {
    interface Window {
        AboutView: typeof AboutView
        AddView: typeof AddView
        Calendar: typeof Calendar
        CalendarView: typeof CalendarView
        Connection: typeof Connection
        defaultTimezone: boolean
        Encoding: typeof Encoding
        EventPage: typeof EventPage
        EventView: typeof EventView
        FullCalendar: typeof FullCalendar
        Home: typeof Home
        HomeView: typeof HomeView
        IndexView: typeof IndexView
        JoinView: typeof JoinView
        LiveView: typeof LiveView
        Me: typeof Me
        MeView: typeof MeView
        MemberView: typeof MemberView
        MembersView: typeof MembersView
        MethodNotAllowedView: typeof MethodNotAllowedView
        Modal: typeof Modal
        NotFoundView: typeof NotFoundView
        Options: typeof Options
        ServerErrorView: typeof ServerErrorView
        StreamersView: typeof StreamersView
        Template: typeof Template
        timezone: string
        Twitch: any
        TwitchOAuthView: typeof TwitchOAuthView
        TwitchRefreshView: typeof TwitchRefreshView
    }
}
