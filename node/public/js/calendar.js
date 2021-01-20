/**
 * @typedef {import("./common/modal")} Modal
 */

//   ###           ##                      #
//  #   #           #                      #
//  #       ###     #     ###   # ##    ## #   ###   # ##
//  #          #    #    #   #  ##  #  #  ##      #  ##  #
//  #       ####    #    #####  #   #  #   #   ####  #
//  #   #  #   #    #    #      #   #  #  ##  #   #  #
//   ###    ####   ###    ###   #   #   ## #   ####  #
/**
 * A class that provides functions for the calendar page.
 */
class Calendar {
    // ###    ##   #  #   ##                #                 #    #                    #           #
    // #  #  #  #  ####  #  #               #                 #    #                    #           #
    // #  #  #  #  ####  #      ##   ###   ###    ##   ###   ###   #      ##    ###   ###   ##    ###
    // #  #  #  #  #  #  #     #  #  #  #   #    # ##  #  #   #    #     #  #  #  #  #  #  # ##  #  #
    // #  #  #  #  #  #  #  #  #  #  #  #   #    ##    #  #   #    #     #  #  # ##  #  #  ##    #  #
    // ###    ##   #  #   ##    ##   #  #    ##   ##   #  #    ##  ####   ##    # #   ###   ##    ###
    /**
     * Sets up the page's.
     * @returns {void}
     */
    static DOMContentLoaded() {
        const calendar = new window.FullCalendar.Calendar(document.getElementById("calendar"), {
            timeZone: window.timezone,
            height: "auto",
            customButtons: {
                add: {
                    text: "Add Event",
                    click: async () => {
                        const template = new window.Template(),
                            div = document.createElement("div");

                        let diff = 0,
                            gameId = void 0;

                        try {
                            await template.loadTemplate("/views/calendar/add.js", "AddView");
                        } catch {
                            return;
                        }
                        const addView = new window.AddView();

                        template.loadDataIntoTemplate(void 0, div, addView.get);

                        Calendar.modal = new window.Modal();

                        Calendar.modal.display(div.innerHTML);

                        const modalDiv = /** @type {HTMLDivElement} */(document.getElementById("modal")), // eslint-disable-line no-extra-parens
                            titleEl = /** @type {HTMLInputElement} */(document.getElementById("title")), // eslint-disable-line no-extra-parens
                            startEl = /** @type {HTMLInputElement} */(document.getElementById("start")), // eslint-disable-line no-extra-parens
                            endEl = /** @type {HTMLInputElement} */(document.getElementById("end")), // eslint-disable-line no-extra-parens
                            gameDropdownDiv = /** @type {HTMLDivElement} */(document.getElementById("game-dropdown")), // eslint-disable-line no-extra-parens
                            gameEl = /** @type {HTMLInputElement} */(document.getElementById("game")), // eslint-disable-line no-extra-parens
                            descriptionEl = /** @type {HTMLTextAreaElement} */(document.getElementById("description")), // eslint-disable-line no-extra-parens
                            saveBtn = /** @type {HTMLButtonElement} */(document.getElementById("save")), // eslint-disable-line no-extra-parens
                            saveErrorDiv = /** @type {HTMLDivElement} */(document.getElementById("save-error")); // eslint-disable-line no-extra-parens

                        gameEl.addEventListener("keyup", () => {
                            if (gameEl.value === "") {
                                return;
                            }

                            const combo = document.querySelector("#game-dropdown .combo");

                            combo.classList.remove("hidden");

                            combo.innerHTML = /* html */`
                                <div class="blink"><div>⏳</div><div>⌛</div></div>
                            `;

                            if (Calendar.gameComboTimeout) {
                                clearTimeout(Calendar.gameComboTimeout);
                            }

                            gameId = void 0;

                            const timeout = window.setTimeout(async () => {
                                /** @type {{id: string, game: string, imageUrl: string}[]} */
                                let data;

                                let res;

                                try {
                                    res = await fetch("/api/games", {
                                        method: "POST",
                                        headers: {
                                            "Content-Type": "application/json"
                                        },
                                        body: JSON.stringify({search: gameEl.value})
                                    });

                                    if (res.status !== 200) {
                                        throw new Error(`Fetch failed with status code ${res.status}.`);
                                    }

                                    data = await res.json();
                                } catch (err) {
                                    combo.innerHTML = /* html */`
                                        ❌ Error loading games list.
                                    `;
                                    return;
                                }

                                if (!document.getElementById("add") || timeout !== Calendar.gameComboTimeout) {
                                    // Modal dialog no longer exists, just bail.
                                    return;
                                }

                                if (data.length === 0) {
                                    combo.innerHTML = /* html */`
                                        <i>No games found.</i>
                                    `;
                                    return;
                                }

                                let html = "";

                                data.forEach((game) => {
                                    html = /* html */`${html}
                                        <div class="item" data-id="${Calendar.encoding.attributeEncode(game.id)}">
                                            <div class="image">${game.imageUrl ? /* html */`<img src="${game.imageUrl}" />` : ""}</div>
                                            <div class="game">${Calendar.encoding.htmlEncode(game.game)}</div>
                                        </div>
                                    `;
                                });

                                combo.innerHTML = html;
                            }, 1000);

                            Calendar.gameComboTimeout = timeout;
                        });

                        modalDiv.addEventListener("focusin", (ev) => {
                            const el = /** @type {HTMLElement} */(ev.target); // eslint-disable-line no-extra-parens

                            if (el.id === "game" || gameDropdownDiv.contains(el)) {
                                return;
                            }

                            document.querySelector("#game-dropdown .combo").classList.add("hidden");
                        });

                        modalDiv.addEventListener("click", (ev) => {
                            const el = /** @type {HTMLElement} */(ev.target); // eslint-disable-line no-extra-parens

                            if (el.id === "game" || gameDropdownDiv.contains(el)) {
                                return;
                            }

                            document.querySelector("#game-dropdown .combo").classList.add("hidden");
                        });

                        document.querySelector("#game-dropdown .combo").addEventListener("click", (ev) => {
                            let el = /** @type {HTMLDivElement} */(ev.target); // eslint-disable-line no-extra-parens

                            while (!el.classList.contains("item")) {
                                el = /** @type {HTMLDivElement} */(el.parentNode); // eslint-disable-line no-extra-parens
                                if (!el) {
                                    return;
                                }
                            }

                            gameEl.value = /** @type {HTMLDivElement} */(el.querySelector(".game")).innerText; // eslint-disable-line no-extra-parens
                            gameId = +el.dataset.id;

                            document.querySelector("#game-dropdown .combo").classList.add("hidden");
                            descriptionEl.focus();
                        });

                        startEl.addEventListener("focus", () => {
                            if (startEl.value && startEl.value !== "" && endEl.value && endEl.value !== "") {
                                diff = new Date(endEl.value).getTime() - new Date(startEl.value).getTime();
                            } else {
                                diff = 0;
                            }
                        });

                        startEl.addEventListener("blur", () => {
                            if (startEl.value && startEl.value !== "") {
                                if (diff > 0) {
                                    endEl.value = new Date(new Date(startEl.value).getTime() + diff).toISOString().slice(0, -8);
                                } else {
                                    endEl.value = startEl.value;
                                }
                            }
                        });

                        saveBtn.addEventListener("click", async () => {
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
                                        gameId,
                                        description: descriptionEl.value && descriptionEl.value !== "" ? descriptionEl.value : void 0
                                    })
                                });

                                if (res.status !== 201) {
                                    throw new Error(`Fetch failed with status code ${res.status}.`);
                                }

                                window.location.href = res.headers.get("Location");
                            } catch (err) {
                                saveBtn.classList.remove("hidden");
                                saveErrorDiv.innerHTML = /* html */`
                                    ❌ Error saving event.
                                `;
                            }
                        });
                    }
                }
            },
            headerToolbar: {
                left: "",
                center: "title",
                right: `${window.defaultTimezone ? "" : "add "}prevYear,prev,next,nextYear`
            },
            events: "/api/events",
            eventDidMount: (ev) => {
                ev.el.title = ev.event.title;
            }
        });

        calendar.render();
    }
}

/** @type {number} */
Calendar.gameComboTimeout = null;

/** @type {Modal} */
Calendar.modal = null;

document.addEventListener("DOMContentLoaded", Calendar.DOMContentLoaded);

/** @type {import("./common/encoding")} */
// @ts-ignore
Calendar.encoding = new (typeof Encoding === "undefined" ? require("./common/encoding") : Encoding)(); // eslint-disable-line no-undef

if (typeof module === "undefined") {
    window.Calendar = Calendar;
} else {
    module.exports = Calendar; // eslint-disable-line no-undef
}
