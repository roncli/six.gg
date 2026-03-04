const path = require("path");

/** @type {{[x: string]: {path: string, contentType: string}}} */
module.exports = {
    "/js/fullcalendar/core.js": {
        path: path.join(__dirname, "../node_modules/@fullcalendar/core/index.global.js"),
        contentType: "text/javascript"
    },
    "/js/fullcalendar/daygrid.js": {
        path: path.join(__dirname, "../node_modules/@fullcalendar/daygrid/index.global.js"),
        contentType: "text/javascript"
    },
    "/js/fullcalendar/list.js": {
        path: path.join(__dirname, "../node_modules/@fullcalendar/list/index.global.js"),
        contentType: "text/javascript"
    }
};
