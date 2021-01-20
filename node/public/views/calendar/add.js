//    #        #      #  #   #    #
//   # #       #      #  #   #
//  #   #   ## #   ## #  #   #   ##     ###   #   #
//  #   #  #  ##  #  ##   # #     #    #   #  #   #
//  #####  #   #  #   #   # #     #    #####  # # #
//  #   #  #  ##  #  ##   # #     #    #      # # #
//  #   #   ## #   ## #    #     ###    ###    # #
/**
 * A class that represents the add modal view.
 */
class AddView {
    //              #
    //              #
    //  ###   ##   ###
    // #  #  # ##   #
    //  ##   ##     #
    // #      ##     ##
    //  ###
    /**
     * Gets the rendered page template.
     * @returns {string} An HTML string of the page.
     */
    get() {
        const date = new Date(new Date().getTime() - 86400000);

        return /* html */`
            <div class="section">Add an Event</div>
            <div>Add an event, and then invite your friends to join it!<br /><br /></div>
            <div id="add">
                <div class="header">Event Title</div>
                <div><input type="text" id="title" maxlength="50" placeholder="Title" /></div>
                <div class="header">Start Date</div>
                <div>
                    <input type="datetime-local" id="start" min="${AddView.encoding.attributeEncode(`${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}T00:00`)}" />
                </div>
                <div class="header">End Date</div>
                <div>
                    <input type="datetime-local" id="end" min="${AddView.encoding.attributeEncode(`${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}T00:00`)}" />
                </div>
                <div class="header">Game</div>
                <div id="game-dropdown" class="dropdown">
                    <input type="text" id="game" placeholder="Start typing to search" />
                    <div class="combo hidden"></div>
                </div>
                <div class="header top">Description</div>
                <div><textarea id="description"></textarea></div>
            </div>
            <button id="save">Save</button><div id="save-error"></div>
        `;
    }
}

/** @type {import("../../js/common/encoding")} */
// @ts-ignore
AddView.encoding = new (typeof Encoding === "undefined" ? require("../../js/common/encoding") : Encoding)(); // eslint-disable-line no-undef

if (typeof module === "undefined") {
    window.AddView = AddView;
} else {
    module.exports = AddView; // eslint-disable-line no-undef
}
