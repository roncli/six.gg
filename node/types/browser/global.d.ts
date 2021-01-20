import AddView from "../../public/views/calendar/add"
import Calendar from "../../public/js/calendar"
import Connection from "../../public/js/common/connection"
import Encoding from "../../public/js/common/encoding"
import EventPage from "../../public/js/event"
import FullCalendar from "../../node_modules/@fullcalendar/core/main"
import Home from "../../public/js/home"
import LiveView from "../../public/views/home/live"
import Me from "../../public/js/me"
import Modal from "../../public/js/common/modal"
import Options from "../../public/js/common/options"
import StreamersView from "../../public/views/home/streamers"
import Template from "../../public/js/common/template"

export {}

declare global {
    interface Window {
        AddView: typeof AddView
        Calendar: typeof Calendar
        Connection: typeof Connection
        defaultTimezone: boolean
        Encoding: typeof Encoding
        EventPage: typeof EventPage
        FullCalendar: typeof FullCalendar
        Home: typeof Home
        LiveView: typeof LiveView
        Me: typeof Me
        Modal: typeof Modal
        Options: typeof Options
        StreamersView: typeof StreamersView
        Template: typeof Template
        timezone: string
        Twitch: any
    }
}
