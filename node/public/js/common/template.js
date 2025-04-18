// MARK: class Template
/**
 * A class that provides template functions.
 */
class Template {
    // MARK: static async loadTemplate
    /**
     * Load a template into memory.
     * @param {string} path The path of the template.
     * @param {string} className The name of the class.
     * @returns {Promise} A promise that resolves when the template is loaded.
     */
    static async loadTemplate(path, className) {
        if (window[className]) {
            return;
        }

        const script = document.createElement("script");

        await new Promise((resolve, reject) => {
            script.onload = resolve;
            script.onerror = reject;
            script.src = path;

            document.head.appendChild(script);
        });
    }

    // MARK: static loadDataIntoTemplate
    /**
     * Loads data into an element.
     * @param {any} data The data to load.
     * @param {Element} el The element to load data into.
     * @param {function} template The template function.
     * @returns {void}
     */
    static loadDataIntoTemplate(data, el, template) {
        if (Array.isArray(data)) {
            el.innerHTML = "";
            data.forEach((item) => {
                el.insertAdjacentHTML("beforeend", template(item));
            });
        } else {
            el.innerHTML = template(data);
        }
    }
}

if (typeof module === "undefined") {
    window.Template = Template;
} else {
    module.exports = Template;
}
