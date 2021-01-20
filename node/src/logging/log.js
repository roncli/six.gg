/**
 * @typedef {import("express").Request} Express.Request
 */

const util = require("util"),

    appInsights = require("applicationinsights");

//  #
//  #
//  #       ###    ## #
//  #      #   #  #  #
//  #      #   #   ##
//  #      #   #  #
//  #####   ###    ###
//                #   #
//                 ###
/**
 * A class that handles logging.
 */
class Log {
    // ##
    //  #
    //  #     ##    ###
    //  #    #  #  #  #
    //  #    #  #   ##
    // ###    ##   #
    //              ###
    /**
     * Logs a message.
     * @param {string} message The message to log.
     * @param {Express.Request} [req] The request object.
     * @returns {void}
     */
    static log(message, req) {
        if (process.env.APPINSIGHTS_INSTRUMENTATIONKEY && process.env.APPINSIGHTS_INSTRUMENTATIONKEY !== "") {
            appInsights.defaultClient.trackTrace({message, time: new Date(), tagOverrides: {"ai.location.ip": req && req.ip || void 0}, properties: {application: "sixgg", container: "sixgg-node", type: "log", path: req && req.path || void 0}});
        } else {
            console.log(`Log: ${message}`);
        }
    }

    //                          #
    //
    // #  #   ###  ###   ###   ##    ###    ###
    // #  #  #  #  #  #  #  #   #    #  #  #  #
    // ####  # ##  #     #  #   #    #  #   ##
    // ####   # #  #     #  #  ###   #  #  #
    //                                      ###
    /**
     * Logs a warning.
     * @param {string} message The string to log.
     * @param {Express.Request} [req] The request object.
     * @returns {void}
     */
    static warning(message, req) {
        if (process.env.APPINSIGHTS_INSTRUMENTATIONKEY && process.env.APPINSIGHTS_INSTRUMENTATIONKEY !== "") {
            appInsights.defaultClient.trackTrace({message, time: new Date(), tagOverrides: {"ai.location.ip": req && req.ip || void 0}, properties: {application: "sixgg", container: "sixgg-node", type: "warning", path: req && req.path || void 0}});
        } else {
            console.log(`Warning: ${message}`);
        }
    }

    //                                #     #
    //                                #
    //  ##   #  #   ##    ##   ###   ###   ##     ##   ###
    // # ##   ##   #     # ##  #  #   #     #    #  #  #  #
    // ##     ##   #     ##    #  #   #     #    #  #  #  #
    //  ##   #  #   ##    ##   ###     ##  ###    ##   #  #
    //                         #
    /**
     * Logs an exception.
     * @param {string} message The message describing the error.
     * @param {object} [obj] The object to log.
     * @param {Express.Request} [req] The request object.
     * @returns {void}
     */
    static exception(message, obj, req) {
        if (process.env.APPINSIGHTS_INSTRUMENTATIONKEY && process.env.APPINSIGHTS_INSTRUMENTATIONKEY !== "") {
            appInsights.defaultClient.trackException({time: new Date(), tagOverrides: {"ai.location.ip": req && req.ip || void 0}, properties: {application: "sixgg", container: "sixgg-node", type: "error", message, path: req && req.path || void 0}, exception: obj});
        } else {
            console.log(`Exception: ${message} ${util.inspect(obj)}`);
        }
    }
}

module.exports = Log;
