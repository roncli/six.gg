//   ###                                       #       #
//  #   #                                      #
//  #       ###   # ##   # ##    ###    ###   ####    ##     ###   # ##
//  #      #   #  ##  #  ##  #  #   #  #   #   #       #    #   #  ##  #
//  #      #   #  #   #  #   #  #####  #       #       #    #   #  #   #
//  #   #  #   #  #   #  #   #  #      #   #   #  #    #    #   #  #   #
//   ###    ###   #   #  #   #   ###    ###     ##    ###    ###   #   #
/**
 * A class of Discord connection functions.
 */
class Connection {
    //              #    #  #        ##
    //              #    #  #         #
    //  ###   ##   ###   #  #  ###    #
    // #  #  # ##   #    #  #  #  #   #
    //  ##   ##     #    #  #  #      #
    // #      ##     ##   ##   #     ###
    //  ###
    /**
     * Gets the URL for a connection.
     * @param {{name: string, id: string, type: string}} connection The connection.
     * @returns {string} The URL.
     */
    getUrl(connection) {
        switch (connection.type) {
            case "steam":
                return `https://steamcommunity.com/profiles/${connection.id}`;
            case "twitch":
                return `https://twitch.tv/${connection.name}`;
            case "twitter":
                return `https://twitter.com/${connection.name}`;
            case "youtube":
                return `https://youtube.com/channel/${connection.id}`;
            default:
                return void 0;
        }
    }
}

if (typeof module === "undefined") {
    window.Connection = Connection;
} else {
    module.exports = Connection; // eslint-disable-line no-undef
}
