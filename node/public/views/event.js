/**
 * @typedef {import("../../types/browser/viewTypes").EventViewParameters} ViewTypes.EventViewParameters
 */

//  #####                        #     #   #    #
//  #                            #     #   #
//  #      #   #   ###   # ##   ####   #   #   ##     ###   #   #
//  ####   #   #  #   #  ##  #   #      # #     #    #   #  #   #
//  #       # #   #####  #   #   #      # #     #    #####  # # #
//  #       # #   #      #   #   #  #   # #     #    #      # # #
//  #####    #     ###   #   #    ##     #     ###    ###    # #
/**
 * A class that represents the event view.
 */
class EventView {
    //              #
    //              #
    //  ###   ##   ###
    // #  #  # ##   #
    //  ##   ##     #
    // #      ##     ##
    //  ###
    /**
     * Gets the rendered page template.
     * @param {ViewTypes.EventViewParameters} data The page data.
     * @returns {string} An HTML string of the page.
     */
    get(data) {
        const {event, user, eventUser, guildMember, attendees} = data,
            attending = attendees && attendees.map((a) => a.user.id).indexOf(user.id) !== -1;

        return /* html */`
            <div class="section">${EventView.encoding.htmlEncode(event.title)}</div>
            <div id="event">
                <div>
                    <span title="Organizer">👤</span>
                    <img src="${guildMember.user.displayAvatarURL({size: 16, format: "png"})}" />
                    <a href="/member/${eventUser.id}/${encodeURIComponent(eventUser.guildMember.nick || eventUser.discord.username || "")}">${EventView.encoding.htmlEncode(eventUser.guildMember.nick || eventUser.discord.username || "")}</a>
                </div>
                <div><span title="Start Date">📅</span> ${event.start.toLocaleString("en-US", {timeZone: user && user.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone, weekday: "short", month: "numeric", day: "numeric", year: "numeric", hour12: true, hour: "numeric", minute: "2-digit", timeZoneName: "short"})}</div>
                <div><span title="End Date">🏁</span> ${event.end.toLocaleString("en-US", {timeZone: user && user.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone, weekday: "short", month: "numeric", day: "numeric", year: "numeric", hour12: true, hour: "numeric", minute: "2-digit", timeZoneName: "short"})}</div>
                <div><span title="Game">👾</span> ${EventView.encoding.htmlEncode(event.game)}</div>
            </div>
            ${event.description && event.description !== "" ? /* html */`
                <div><span title="Description">📝</span> ${EventView.encoding.htmlEncode(event.description)}</div>
            ` : ""}
            ${user ? /* html */`
                ${user.id === eventUser.id ? /* html */`
                    <div class="section">Manage Your Event</div>
                    <div><button id="delete" data-id="${event.id}">Delete Event</button> <span id="error"></span></div>
                ` : /* html */`
                    <div class="section">Manage Your Event Attendance</div>
                    <div>You are ${attending ? "" : "not yet "}attending this event.</div>
                    ${attending ? /* html */ `
                        <div><button id="leave" data-id="${event.id}">Leave Event</button> <span id="error"></span></div>
                    ` : /* html */`
                        <div><button id="attend" data-id="${event.id}">Attend Event</button> <span id="error"></span></div>
                    `}
                `}
            ` : /* html */`
                <div class="section">Log In to Join this Event</div>
            `}
            ${attendees && attendees.length > 0 ? /* html */`
                <div class="section">Attendees</div>
                <div id="attendees">
                    ${attendees.map((a) => /* html */`
                        <div>
                            <img src="${a.guildMember.user.displayAvatarURL({size: 16, format: "png"})}" />
                            <a href="/member/${a.user.id}/${encodeURIComponent(a.user.guildMember.nick || a.user.discord.username || "")}">${EventView.encoding.htmlEncode(a.user.guildMember.nick || a.user.discord.username || "")}</a>
                        </div>
                    `).join("")}
                </div>
            ` : ""}
        `;
    }
}

/** @type {import("../js/common/encoding")} */
// @ts-ignore
EventView.encoding = new (typeof Encoding === "undefined" ? require("../js/common/encoding") : Encoding)(); // eslint-disable-line no-undef

if (typeof module !== "undefined") {
    module.exports = EventView; // eslint-disable-line no-undef
}
