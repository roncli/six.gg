// MARK: class Me
/**
 * A class that provides functions for the me page.
 */
class Me {
    /** @type {{[x: string]: number}} */
    static #fadeouts = {};

    // MARK: static #fadeout
    /**
     * Fades out a span element.
     * @param {string} id The ID of the span element.
     * @param {HTMLSpanElement} span The span element.
     * @returns {void}
     */
    static #fadeout(span, id) {
        span.classList.remove("fade-out");

        if (Me.#fadeouts[id]) {
            clearTimeout(Me.#fadeouts[id]);
            delete Me.#fadeouts[id];
        }

        Me.#fadeouts[id] = window.setTimeout(() => {
            span.classList.add("fade-out");
            delete Me.#fadeouts[id];
        }, 1000);
    }

    // MARK: static #saveLocation
    /**
     * Saves the user's location.
     * @param {FocusEvent} ev The event.
     * @returns {Promise<void>}
     */
    static async #saveLocation(ev) {
        const input = /** @type {HTMLInputElement} */(ev.target), // eslint-disable-line @stylistic/no-extra-parens
            span = /** @type {HTMLSpanElement} */(input.nextSibling); // eslint-disable-line @stylistic/no-extra-parens

        const res = await fetch("/api/me", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({location: input.value})
        });

        if (res.status === 204) {
            span.innerText = "✅";
        } else {
            span.innerText = "❌";
        }

        Me.#fadeout(span, input.id);
    }

    // MARK: static #saveTimezone
    /**
     * Saves the user's timezone.
     * @param {Event} ev The event.
     * @returns {Promise<void>}
     */
    static async #saveTimezone(ev) {
        const select = /** @type {HTMLSelectElement} */(ev.target), // eslint-disable-line @stylistic/no-extra-parens
            span = /** @type {HTMLSpanElement} */(select.nextSibling); // eslint-disable-line @stylistic/no-extra-parens

        const res = await fetch("/api/me", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({timezone: select.value})
        });

        if (res.status === 204) {
            span.innerText = "✅";
        } else {
            span.innerText = "❌";
        }

        Me.#fadeout(span, select.id);
    }

    // MARK: static DOMContentLoaded
    /**
     * Sets up the page's events.
     * @returns {void}
     */
    static DOMContentLoaded() {
        document.getElementById("location").addEventListener("focusout", Me.#saveLocation);
        document.getElementById("timezone").addEventListener("change", Me.#saveTimezone);
    }
}

document.addEventListener("DOMContentLoaded", Me.DOMContentLoaded);

if (typeof module === "undefined") {
    window.Me = Me;
} else {
    module.exports = Me;
}
