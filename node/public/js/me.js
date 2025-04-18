// MARK: class Me
/**
 * A class that provides functions for the me page.
 */
class Me {
    /** @type {{[x: string]: number}} */
    static #fadeouts = {};

    // MARK: static DOMContentLoaded
    /**
     * Sets up the page's events.
     * @returns {void}
     */
    static DOMContentLoaded() {
        document.getElementById("location").addEventListener("focusout", async (ev) => {
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

            span.classList.remove("fade-out");

            if (Me.#fadeouts[input.id]) {
                clearTimeout(Me.#fadeouts[input.id]);
                delete Me.#fadeouts[input.id];
            }

            Me.#fadeouts[input.id] = window.setTimeout(() => {
                span.classList.add("fade-out");
                delete Me.#fadeouts[input.id];
            }, 1000);
        });

        document.getElementById("timezone").addEventListener("change", async (ev) => {
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

            span.classList.remove("fade-out");

            if (Me.#fadeouts[select.id]) {
                clearTimeout(Me.#fadeouts[select.id]);
                delete Me.#fadeouts[select.id];
            }

            Me.#fadeouts[select.id] = window.setTimeout(() => {
                span.classList.add("fade-out");
                delete Me.#fadeouts[select.id];
            }, 1000);
        });
    }
}

document.addEventListener("DOMContentLoaded", Me.DOMContentLoaded);

if (typeof module === "undefined") {
    window.Me = Me;
} else {
    module.exports = Me;
}
