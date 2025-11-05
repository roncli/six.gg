/**
 * @typedef {import("@fullcalendar/core").EventMountArg} FullCalendar.EventMountArg
 */

// MARK: class Calendar
/**
 * A class that provides functions for the calendar page.
 */
class Calendar {
    static #Encoding = typeof module === "undefined" ? window.Encoding : require("./common/encoding");
    static #Modal = typeof module === "undefined" ? window.Modal : require("./common/modal");
    static #Template = typeof module === "undefined" ? window.Template : require("./common/template");

    static #diff = 0;

    /** @type {number} */
    static #gameComboTimeout = null;

    /** @type {number} */
    static #gameId = void 0;

    /** @type {import("./common/modal")} */
    static #modal = null;

    // MARK: static #calculateTimeDifference
    /**
     * Calculates the time difference between the start and end times.
     * @returns {void}
     */
    static #calculateTimeDifference() {
        const startEl = /** @type {HTMLInputElement} */(document.getElementById("start")), // eslint-disable-line @stylistic/no-extra-parens
            endEl = /** @type {HTMLInputElement} */(document.getElementById("end")); // eslint-disable-line @stylistic/no-extra-parens

        if (startEl.value && startEl.value !== "" && endEl.value && endEl.value !== "") {
            Calendar.#diff = new Date(endEl.value).getTime() - new Date(startEl.value).getTime();
        } else {
            Calendar.#diff = 0;
        }
    }

    // MARK: static async #fetchAndDisplayGameResults
    /**
     * Fetches and displays game results in the add event modal.
     * @param {number} timeout The timeout identifier.
     * @returns {Promise<void>}
     */
    static async #fetchAndDisplayGameResults(timeout) {
        /** @type {{id: string, game: string, imageUrl: string}[]} */
        let data;

        const gameDropdownDiv = /** @type {HTMLDivElement} */(document.getElementById("game-dropdown")), // eslint-disable-line @stylistic/no-extra-parens
            gameEl = /** @type {HTMLInputElement} */(document.getElementById("game")), // eslint-disable-line @stylistic/no-extra-parens
            combo = gameDropdownDiv.querySelector(".combo");
        let res;

        try {
            res = await fetch("/api/games", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({search: gameEl.value})
            });

            if (res.status !== 200) {
                throw new Error(`Fetch failed with status code ${res.status}.`);
            }

            data = await res.json();
        } catch {
            combo.innerHTML = /* html */`
                ❌ Error loading games list.
            `;
            return;
        }

        if (!document.getElementById("add") || timeout !== Calendar.#gameComboTimeout) {
            // Modal dialog no longer exists, just bail.
            return;
        }

        if (data.length === 0) {
            combo.innerHTML = /* html */`
                <i>No games found.</i>
            `;
            return;
        }

        combo.innerHTML = data.map((game) => /* html */`
            <div class="item" data-id="${Calendar.#Encoding.attributeEncode(game.id)}">
                <div class="image">${game.imageUrl ? /* html */`<img src="${game.imageUrl}" />` : ""}</div>
                <div class="game">${Calendar.#Encoding.htmlEncode(game.game)}</div>
            </div>
        `).join("");
    }

    // MARK: static #hideGameDropdown
    /**
     * Hides the game dropdown.
     * @param {FocusEvent | MouseEvent} ev The focus or mouse event.
     * @returns {void}
     */
    static #hideGameDropdown(ev) {
        const el = /** @type {HTMLElement} */(ev.target), // eslint-disable-line @stylistic/no-extra-parens
            gameDropdownDiv = /** @type {HTMLDivElement} */(document.getElementById("game-dropdown")); // eslint-disable-line @stylistic/no-extra-parens

        if (el.id === "game" || gameDropdownDiv.contains(el)) {
            return;
        }

        document.querySelector("#game-dropdown .combo").classList.add("hidden");
    }

    // MARK: static async #openAddEventModal
    /**
     * Opens the add event modal.
     * @returns {Promise<void>}
     */
    static async #openAddEventModal() {
        try {
            await Calendar.#Template.loadTemplate("/views/calendar/add.js", "AddView");
        } catch {
            return;
        }

        const div = document.createElement("div");
        Calendar.#Template.loadDataIntoTemplate(void 0, div, window.AddView.get);

        Calendar.#modal = new Calendar.#Modal();
        Calendar.#modal.display(div.innerHTML);

        const modalDiv = /** @type {HTMLDivElement} */(document.getElementById("modal")), // eslint-disable-line @stylistic/no-extra-parens
            startEl = /** @type {HTMLInputElement} */(document.getElementById("start")), // eslint-disable-line @stylistic/no-extra-parens
            gameEl = /** @type {HTMLInputElement} */(document.getElementById("game")), // eslint-disable-line @stylistic/no-extra-parens
            saveBtn = /** @type {HTMLButtonElement} */(document.getElementById("save")); // eslint-disable-line @stylistic/no-extra-parens

        gameEl.addEventListener("keyup", Calendar.#queueGameResults);
        modalDiv.addEventListener("focusin", Calendar.#hideGameDropdown);
        modalDiv.addEventListener("click", Calendar.#hideGameDropdown);
        document.querySelector("#game-dropdown .combo").addEventListener("click", Calendar.#selectGame);
        startEl.addEventListener("focus", Calendar.#calculateTimeDifference);
        startEl.addEventListener("blur", Calendar.#synchronizeEndTimeFromDifference);
        saveBtn.addEventListener("click", Calendar.#saveEvent);
    }

    // MARK: static #queueGameResults
    /**
     * Queues fetching and displaying game results in the add event modal.
     * @returns {void}
     */
    static #queueGameResults() {
        const gameEl = /** @type {HTMLInputElement} */(document.getElementById("game")), // eslint-disable-line @stylistic/no-extra-parens
            gameDropdownDiv = /** @type {HTMLDivElement} */(document.getElementById("game-dropdown")); // eslint-disable-line @stylistic/no-extra-parens

        if (gameEl.value === "") {
            return;
        }

        const combo = gameDropdownDiv.querySelector(".combo");
        combo.classList.remove("hidden");
        combo.innerHTML = /* html */`
            <div class="blink"><div>⏳</div><div>⌛</div></div>
        `;

        if (Calendar.#gameComboTimeout) {
            clearTimeout(Calendar.#gameComboTimeout);
        }

        Calendar.#gameId = void 0;

        const timeout = window.setTimeout(() => Calendar.#fetchAndDisplayGameResults(timeout), 1000);

        Calendar.#gameComboTimeout = timeout;
    }

    // MARK: static async #saveEvent
    /**
     * Saves the event.
     * @returns {Promise<void>}
     */
    static async #saveEvent() {
        const descriptionEl = /** @type {HTMLTextAreaElement} */(document.getElementById("description")), // eslint-disable-line @stylistic/no-extra-parens
            endEl = /** @type {HTMLInputElement} */(document.getElementById("end")), // eslint-disable-line @stylistic/no-extra-parens
            gameEl = /** @type {HTMLInputElement} */(document.getElementById("game")), // eslint-disable-line @stylistic/no-extra-parens
            saveBtn = /** @type {HTMLButtonElement} */(document.getElementById("save")), // eslint-disable-line @stylistic/no-extra-parens
            saveErrorDiv = /** @type {HTMLDivElement} */(document.getElementById("save-error")), // eslint-disable-line @stylistic/no-extra-parens
            startEl = /** @type {HTMLInputElement} */(document.getElementById("start")), // eslint-disable-line @stylistic/no-extra-parens
            titleEl = /** @type {HTMLInputElement} */(document.getElementById("title")); // eslint-disable-line @stylistic/no-extra-parens

        try {
            saveBtn.classList.remove("hidden");
            saveErrorDiv.innerHTML = /* html */`
                <div class="blink"><div>⏳</div><div>⌛</div></div>
            `;

            const res = await fetch("/api/events", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    title: titleEl.value,
                    start: startEl.value && startEl.value !== "" ? new Date(startEl.value) : void 0,
                    end: endEl.value && endEl.value !== "" ? new Date(endEl.value) : void 0,
                    game: gameEl.value && gameEl.value !== "" ? gameEl.value : void 0,
                    gameId: Calendar.#gameId,
                    description: descriptionEl.value && descriptionEl.value !== "" ? descriptionEl.value : void 0
                })
            });

            if (res.status !== 201) {
                throw new Error(`Fetch failed with status code ${res.status}.`);
            }

            window.location.href = res.headers.get("Location");
        } catch {
            saveBtn.classList.remove("hidden");
            saveErrorDiv.innerHTML = /* html */`
                ❌ Error saving event.
            `;
        }
    }

    // MARK: static #selectGame
    /**
     * Selects a game from the dropdown.
     * @param {MouseEvent} ev The mouse event.
     * @returns {void}
     */
    static #selectGame(ev) {
        let el = /** @type {HTMLDivElement} */(ev.target); // eslint-disable-line @stylistic/no-extra-parens
        const gameEl = /** @type {HTMLInputElement} */(document.getElementById("game")), // eslint-disable-line @stylistic/no-extra-parens
            descriptionEl = /** @type {HTMLTextAreaElement} */(document.getElementById("description")); // eslint-disable-line @stylistic/no-extra-parens

        while (!el.classList.contains("item")) {
            el = /** @type {HTMLDivElement} */(el.parentNode); // eslint-disable-line @stylistic/no-extra-parens
            if (!el || !el.classList) {
                return;
            }
        }

        gameEl.value = /** @type {HTMLDivElement} */(el.querySelector(".game")).innerText; // eslint-disable-line @stylistic/no-extra-parens
        Calendar.#gameId = +el.dataset.id;

        document.querySelector("#game-dropdown .combo").classList.add("hidden");
        descriptionEl.focus();
    }

    // MARK: static #setTitle
    /**
     * Sets the title of the event's element.
     * @param {FullCalendar.EventMountArg} ev The event mount argument.
     * @returns {void}
     */
    static #setTitle(ev) {
        ev.el.title = ev.event.title;
    }

    // MARK: static #synchronizeEndTimeFromDifference
    /**
     * Synchronizes the end time based on the start time and the previously calculated difference.
     * @returns {void}
     */
    static #synchronizeEndTimeFromDifference() {
        const startEl = /** @type {HTMLInputElement} */(document.getElementById("start")), // eslint-disable-line @stylistic/no-extra-parens
            endEl = /** @type {HTMLInputElement} */(document.getElementById("end")); // eslint-disable-line @stylistic/no-extra-parens

        if (startEl.value && startEl.value !== "") {
            if (Calendar.#diff > 0) {
                endEl.value = new Date(new Date(startEl.value).getTime() + Calendar.#diff).toISOString().slice(0, -8);
            } else {
                endEl.value = startEl.value;
            }
        }
    }

    // MARK: static DOMContentLoaded
    /**
     * Sets up the page.
     * @param {string} timezone The user's timezone.
     * @param {boolean} defaultTimezone Whether the default timezone is being used.
     * @returns {void}
     */
    static DOMContentLoaded(timezone, defaultTimezone) {
        const calendar = new window.FullCalendar.Calendar(document.getElementById("calendar"), {
            timeZone: timezone,
            height: "auto",
            customButtons: {
                add: {
                    text: "Add Event",
                    click: Calendar.#openAddEventModal
                }
            },
            headerToolbar: {
                left: "",
                center: "title",
                right: `${defaultTimezone ? "" : "add "}prevYear,prev,next,nextYear`
            },
            events: "/api/events",
            eventDidMount: Calendar.#setTitle
        });

        calendar.render();
    }
}

if (typeof module === "undefined") {
    window.Calendar = Calendar;
} else {
    module.exports = Calendar;
}
