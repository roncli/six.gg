const appInsights = require("applicationinsights"),
    Docker = require("./src/docker"),
    gelfserver = require("graygelf/server"),

    logMatch = /(?<ipaddress>\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}) - (?<remoteuser>.+) \[(?<date>\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}\+\d{2}:\d{2})\] (?<servername>.+) (?<serverport>\d+) "(?<request>(?<method>[a-z]+) (?<url>.+)(?<http>http\/[12]\.[01])|.+)" (?<statuscode>\d{3}) (?<bytessent>\d+) (?<requesttime>\d+(?:.\d+)) "(?<referrer>.+)" "(?<useragent>.+)"/i,
    port = process.env.PORT || 12201,
    severityEnum = {
        F: 4,
        E: 3,
        W: 2,
        I: 1,
        D: 0,
        D1: 0,
        D2: 0,
        D3: 0,
        D4: 0,
        D5: 0
    },
    successMatch = /^[23]/;

const docker = new Docker();

//   ###              #
//    #               #
//    #    # ##    ## #   ###   #   #
//    #    ##  #  #  ##  #   #   # #
//    #    #   #  #   #  #####    #
//    #    #   #  #  ##  #       # #
//   ###   #   #   ## #   ###   #   #
/**
 * The primary class for the application.
 */
class Index {
    //         #                 #
    //         #                 #
    //  ###   ###    ###  ###   ###   #  #  ###
    // ##      #    #  #  #  #   #    #  #  #  #
    //   ##    #    # ##  #      #    #  #  #  #
    // ###      ##   # #  #       ##   ###  ###
    //                                      #
    /**
     * Starts up the application.
     * @returns {void}
     */
    static startup() {
        // Setup application insights.
        appInsights.setup();
        appInsights.start();

        const server = gelfserver();

        server.on("message", (gelf) => {
            const tagOverrides = {};
            if (gelf._container_name) {
                tagOverrides.Container = gelf._container_name;
            }

            // Check for nginx log.
            if (logMatch.test(gelf.short_message)) {
                const {groups: {ipaddress, remoteuser, date, servername, serverport, request, method, url, http, statuscode, bytessent, requesttime, referrer, useragent}} = logMatch.exec(gelf.short_message);

                appInsights.defaultClient.trackRequest({tagOverrides: {"ai.location.ip": ipaddress}, name: `${method} ${url}`, url: `${serverport === "443" ? "https" : "http"}://${servername}${url}`, duration: +requesttime * 1000, resultCode: statuscode, success: successMatch.test(statuscode), time: new Date(date), properties: {application: process.env.APPLICATION, container: gelf._container_name || "sixgg-logging", ipaddress, remoteuser, serverport: +serverport, request, http, bytessent: +bytessent, referrer, useragent}});

                return;
            }

            // Check for Mongo log.
            try {
                const data = JSON.parse(gelf.short_message);

                if (data && data.t && data.s && data.c && data.id && data.ctx && data.msg) {
                    const {t: time, s: severity, c: component, id, ctx: context, msg: message} = data;
                    let date = time && time.$date && new Date(time.$date) || void 0;

                    if (date && date.toString() === "Invalid Date") {
                        date = void 0;
                    }

                    const properties = {application: process.env.APPLICATION, container: gelf._container_name, component, id, context};
                    if (data.attr) {
                        properties.attributes = data.attr;
                    }
                    if (data.tags) {
                        properties.tags = data.tags;
                    }
                    if (data.truncated) {
                        properties.truncated = data.truncated;
                    }
                    if (data.size) {
                        properties.originalSize = data.size;
                    }

                    if (severityEnum[severity] >= 3) {
                        appInsights.defaultClient.trackException({exception: new Error(message), severity: severityEnum[severity], time: date, properties});
                    } else {
                        appInsights.defaultClient.trackTrace({message, severity: severityEnum[severity], time: date, properties});
                    }

                    return;
                }
            } catch (err) {}

            // Default log.
            appInsights.defaultClient.trackTrace({message: gelf.short_message, properties: {application: process.env.APPLICATION, container: gelf._container_name || "sixgg-logging"}});
        });

        server.listen(port);
        console.log(`Server PID ${process.pid} listening on port ${port}.`);

        docker.start();
    }
}

Index.startup();
