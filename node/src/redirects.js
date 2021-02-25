const path = require("path");

/** @type {{[x: string]: {path: string, contentType: string}}} */
module.exports = {
    "/js/fullcalendar/core.js": {
        path: path.join(__dirname, "../node_modules/@fullcalendar/core/main.global.js"),
        contentType: "text/javascript"
    },
    "/js/fullcalendar/daygrid.js": {
        path: path.join(__dirname, "../node_modules/@fullcalendar/daygrid/main.global.js"),
        contentType: "text/javascript"
    },
    "/js/fullcalendar/list.js": {
        path: path.join(__dirname, "../node_modules/@fullcalendar/list/main.global.js"),
        contentType: "text/javascript"
    },
    "/css/fullcalendar/common.css": {
        path: path.join(__dirname, "../node_modules/@fullcalendar/common/main.css"),
        contentType: "text/css"
    },
    "/css/fullcalendar/daygrid.css": {
        path: path.join(__dirname, "../node_modules/@fullcalendar/daygrid/main.css"),
        contentType: "text/css"
    },
    "/css/fullcalendar/list.css": {
        path: path.join(__dirname, "../node_modules/@fullcalendar/list/main.css"),
        contentType: "text/css"
    }
};
