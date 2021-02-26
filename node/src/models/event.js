/**
 * @typedef {import("../../types/node/eventTypes").EventData} EventTypes.EventData
 */

const Discord = require("../discord"),
    Encoding = require("../../public/js/common/encoding"),
    EventDb = require("../database/event"),
    Exception = require("../errors/exception"),
    User = require("./user");

//  #####                        #
//  #                            #
//  #      #   #   ###   # ##   ####
//  ####   #   #  #   #  ##  #   #
//  #       # #   #####  #   #   #
//  #       # #   #      #   #   #  #
//  #####    #     ###   #   #    ##
/**
 * A class that represents a calendar event.
 */
class Event {
    //          #     #
    //          #     #
    //  ###   ###   ###
    // #  #  #  #  #  #
    // # ##  #  #  #  #
    //  # #   ###   ###
    /**
     * Adds an event.
     * @param {EventTypes.EventData} data The event data.
     * @returns {Promise<Event>} A promise that returns the created event.
     */
    static async add(data) {
        try {
            data = await EventDb.add(data);
        } catch (err) {
            throw new Exception("There was an error while adding an event to the database.", err);
        }

        try {
            const user = await User.getMember(data.userId);

            const embed = Discord.messageEmbed({
                title: `New event posted: **${Encoding.discordEncode(data.title)}** by ${user.guildMember.user}`,
                fields: []
            });

            if (data.description) {
                embed.description = `${data.description.substring(0, 512)}${data.description.length > 512 ? "..." : ""}`;
            }

            if (data.game) {
                embed.fields.push({
                    name: "Game",
                    value: data.game,
                    inline: false
                });
            }

            embed.fields.push({
                name: "Time",
                value: `${data.start.toLocaleString("en-US", {timeZone: process.env.DEFAULT_TIMEZONE, hour12: true, month: "numeric", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit", timeZoneName: "short"})} to ${data.end.toLocaleString("en-US", {timeZone: process.env.DEFAULT_TIMEZONE, hour12: true, month: "numeric", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit", timeZoneName: "short"})}`,
                inline: false
            });

            embed.fields.push({
                name: "Joining",
                value: `Type \`!join ${data._id}\` to be notified within 30 minutes of the event's start.`,
                inline: true
            });

            embed.fields.push({
                name: "Leaving",
                value: `If you've already joined the event but no longer wish to take part, type \`!leave ${data._id}\`.`,
                inline: true
            });

            Discord.richQueue(embed, Discord.findTextChannelByName("event-announcements"));
        } catch (err) {
            throw new Exception("There was a Discord error while announcing a new event.", err);
        }

        return new Event(data);
    }

    //              #
    //              #
    //  ###   ##   ###
    // #  #  # ##   #
    //  ##   ##     #
    // #      ##     ##
    //  ###
    /**
     * Gets an event by ID.
     * @param {number} id The event ID.
     * @returns {Promise<Event>} A promise that returns the event.
     */
    static async get(id) {
        /** @type {EventTypes.EventData} */
        let event;
        try {
            event = await EventDb.get(id);
        } catch (err) {
            throw new Exception("There was an error while getting an event from the database.", err);
        }

        if (!event) {
            return void 0;
        }

        return new Event(event);
    }

    //              #    ###         ###          #          ###
    //              #    #  #        #  #         #          #  #
    //  ###   ##   ###   ###   #  #  #  #   ###  ###    ##   #  #   ###  ###    ###   ##
    // #  #  # ##   #    #  #  #  #  #  #  #  #   #    # ##  ###   #  #  #  #  #  #  # ##
    //  ##   ##     #    #  #   # #  #  #  # ##   #    ##    # #   # ##  #  #   ##   ##
    // #      ##     ##  ###     #   ###    # #    ##   ##   #  #   # #  #  #  #      ##
    //  ###                     #                                               ###
    /**
     * Gets events by a date range.
     * @param {Date} start The start date.
     * @param {Date} end The end date.
     * @returns {Promise<Event[]>} A promise that returns the events.
     */
    static async getByDateRange(start, end) {
        /** @type {EventTypes.EventData[]} */
        let events;
        try {
            events = await EventDb.getByDateRange(start, end);
        } catch (err) {
            throw new Exception("There was an error while getting events from the database.", err);
        }

        if (!events) {
            return void 0;
        }

        return events && events.map((e) => new Event(e)) || [];
    }

    // ###    ##   # #    ##   # #    ##
    // #  #  # ##  ####  #  #  # #   # ##
    // #     ##    #  #  #  #  # #   ##
    // #      ##   #  #   ##    #     ##
    /**
     * Removes an event from the database.
     * @param {number} eventId The event ID.
     * @param {number} userId The user ID.
     * @returns {Promise<boolean>} A promise that returns whether the event has been removed.
     */
    static async remove(eventId, userId) {
        let event;
        try {
            event = await EventDb.get(eventId);
        } catch (err) {
            throw new Exception("There was an error getting an event while attempting to delete it from the database.", err);
        }

        if (!event || event.userId !== userId) {
            return false;
        }

        try {
            await EventDb.remove(eventId);
        } catch (err) {
            throw new Exception("There was an error getting an event while attempting to delete it from the database.", err);
        }

        try {
            const user = await User.getMember(event.userId);

            await Discord.queue(`The event **${Encoding.discordEncode(event.title)}** by ${user.guildMember.user} on ${event.start.toLocaleString("en-US", {timeZone: process.env.DEFAULT_TIMEZONE, month: "numeric", day: "numeric", year: "numeric"})} has been cancelled.`, Discord.findTextChannelByName("event-announcements"));
        } catch (err) {
            throw new Exception("There was a Discord error announcing that an event has been cancelled.", err);
        }

        return true;
    }

    //                           #                       #
    //                           #                       #
    //  ##    ##   ###    ###   ###   ###   #  #   ##   ###    ##   ###
    // #     #  #  #  #  ##      #    #  #  #  #  #      #    #  #  #  #
    // #     #  #  #  #    ##    #    #     #  #  #      #    #  #  #
    //  ##    ##   #  #  ###      ##  #      ###   ##     ##   ##   #
    /**
     * Creates a new event.
     * @param {EventTypes.EventData} event The event.
     */
    constructor(event) {
        this.id = event._id;
        this.title = event.title;
        this.start = event.start;
        this.end = event.end;
        this.userId = event.userId;
        this.game = event.game;
        this.gameId = event.gameId;
        this.description = event.description;
    }
}

module.exports = Event;
