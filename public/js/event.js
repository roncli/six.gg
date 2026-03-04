// MARK: class EventPage
/**
 * A class that provides functions for the event page.
 */
class EventPage {
    // MARK: static async #attendEvent
    /**
     * Lets the user attend the event.
     * @returns {Promise<void>}
     */
    static async #attendEvent() {
        const attendBtn = document.getElementById("attend");

        if (!attendBtn) {
            throw new Error("Attend button not found.");
        }

        const res = await fetch(`/api/event/${attendBtn.dataset.id}/attendee`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            }
        });

        if (res.status === 201) {
            window.location.reload();
        } else {
            const errorDiv = document.getElementById("error");
            if (errorDiv) {
                errorDiv.innerText = "❌ Error joining event.";
            }
        }
    }

    // MARK: static async #deleteEvent
    /**
     * Deletes the event.
     * @returns {Promise<boolean>} Whether the event was deleted.
     */
    static async #deleteEvent() {
        const deleteBtn = document.getElementById("delete");

        if (!deleteBtn) {
            throw new Error("Delete button not found.");
        }

        if (window.confirm("Are you sure you want to delete this event?")) {
            const res = await fetch(`/api/event/${deleteBtn.dataset.id}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json"
                }
            });

            if (res.status === 204) {
                return true;
            }

            const errorDiv = document.getElementById("error");
            if (errorDiv) {
                errorDiv.innerText = "❌ Error deleting event.";
            }
        }

        return false;
    }

    // MARK: static async #leaveEvent
    /**
     * Lets the user leave the event.
     * @returns {Promise<void>}
     */
    static async #leaveEvent() {
        const leaveBtn = document.getElementById("leave");

        if (!leaveBtn) {
            throw new Error("Leave button not found.");
        }

        const res = await fetch(`/api/event/${leaveBtn.dataset.id}/attendee`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json"
            }
        });

        if (res.status === 204) {
            window.location.reload();
        } else {
            const errorDiv = document.getElementById("error");
            if (errorDiv) {
                errorDiv.innerText = "❌ Error leaving event.";
            }
        }
    }

    static #queue = Promise.resolve();

    // MARK: static async #onClick
    /**
     * Handles when an event button is clicked, queuing the requests in order.
     * @param {PointerEvent} ev The event.
     * @returns {void}
     */
    static #onClick(ev) {
        const {target} = /** @type {{target: HTMLElement | null}} */(ev);
        if (!target) {
            throw new Error("Unknown button clicked.");
        }

        EventPage.#queue = EventPage.#queue.then(async () => {
            try {
                document.body.style.cursor = "progress";

                if (target.id === "attend") {
                    await EventPage.#attendEvent();
                } else if (target.id === "delete") {
                    if (await EventPage.#deleteEvent()) {
                        window.location.href = "/calendar";
                    }
                } else if (target.id === "leave") {
                    await EventPage.#leaveEvent();
                } else {
                    throw new Error("Unknown button clicked.");
                }
            } finally {
                document.body.style.cursor = "";
            }
        });
    }

    // MARK: static DOMContentLoaded
    /**
     * Sets up the page.
     * @returns {void}
     */
    static DOMContentLoaded() {
        const deleteBtn = document.getElementById("delete"),
            attendBtn = document.getElementById("attend"),
            leaveBtn = document.getElementById("leave");

        if (deleteBtn) {
            deleteBtn.addEventListener("click", EventPage.#onClick);
        }

        if (attendBtn) {
            attendBtn.addEventListener("click", EventPage.#onClick);
        }

        if (leaveBtn) {
            leaveBtn.addEventListener("click", EventPage.#onClick);
        }
    }
}

document.addEventListener("DOMContentLoaded", EventPage.DOMContentLoaded);

if (typeof module === "undefined") {
    window.EventPage = EventPage;
} else {
    module.exports = EventPage;
}
