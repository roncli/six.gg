// MARK: class Modal
/**
 * A class to create a modal dialog.
 */
class Modal {
    // MARK: close
    /**
     * Closes the modal dialog.
     * @returns {void}
     */
    close() {
        this.el.parentNode.removeChild(this.el);
    }

    // MARK: display
    /**
     * Display a modal dialog.
     * @param {string} html The HTML to display.
     * @returns {void}
     */
    display(html) {
        const modal = /* html */`
            <div class="content">
                <span class="close">❌</span>
                ${html}
            </div>
        `;

        const oldEl = document.getElementById("modal");

        if (oldEl) {
            oldEl.parentNode.removeChild(oldEl);
        }

        this.el = document.createElement("div");

        this.el.id = "modal";
        this.el.innerHTML = modal;

        document.getElementById("page-body").appendChild(this.el);

        document.querySelector("#modal .close").addEventListener("click", () => {
            this.close();
        });
    }
}

if (typeof module === "undefined") {
    window.Modal = Modal;
} else {
    module.exports = Modal;
}
