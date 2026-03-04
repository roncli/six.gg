// MARK: class AboutView
/**
 * A class that represents the about view.
 */
class AboutView {
    // MARK: static get
    /**
     * Gets the rendered page template.
     * @returns {string} An HTML string of the page.
     */
    static get() {
        return /* html */`
            <div class="section">About Six Gaming</div>
            <div>
                It all began as a World of Warcraft raiding guild called Six Minutes To Release, founded in December of 2007 by roncli and solitha.  The guild raided for seven years until February of 2015, but during that time many friendships were made, and from those friendships Six Gaming was born.<br /><br />
                Colzaratha is credited with coining the name "Six Gaming", which was used as a League of Legends team name.  That name would later be used for Showsan's podcast, the Six Gaming Podcast.<br /><br />
                Today, we are a group of passionate gamers who love playing games with and against each other.  You can find us hanging out on our <a href="https://ronc.li/six-discord" target="_blank">Discord server</a>.  Everyone is welcome to join Six Gaming!
            </div>
            <div class="section">SixBotGG</div>
            <div class="subsection">Six Gaming's Discord bot</div>
            <div>
                Six Gaming's Discord server takes communication a step further with our chat bot, SixBotGG.  When you join the server, you'll see a channel called #sixbotgg.  This is where our bot listens to commands and sends most of its replies.  All commands begin with an exclamation point.
            </div>
            <div id="commands">
                <div class="header">Command</div>
                <div class="header">Description</div>
                <div class="header">Examples</div>

                <div class="section">Basic Commands</div>

                <div class="command">/help</div>
                <div>Get a link to this page.</div>
                <div class="example">/help</div>

                <div class="command">/version</div>
                <div>Get the version of the bot.</div>
                <div class="example">/version</div>

                <div class="command">/website</div>
                <div>Get a link to the website.</div>
                <div class="example">/website</div>

                <div class="command">/timezone &lt;timezone></div>
                <div>Sets your timezone.  You must have an account on the website before using this command.</div>
                <div class="example">/timezone America/Los_Angeles</div>

                <div class="section">Voice Channels</div>

                <div class="command">/addchannel &lt;name&gt;</div>
                <div>Adds a voice channel to the Discord server.  You are limited to one channel per 5 minutes.  Channels will be removed after 5 minutes of inactivity.</div>
                <div class="example">/addchannel WoW Raid</div>

                <div class="command">/limit (0-99)</div>
                <div>Limits the number of people that can chat in your most recently-created voice channel.  Use 0 to remove the limit.</div>
                <div class="example">/limit 25</div>

                <div class="command">/private</div>
                <div>Makes your most recently-created voice channel private so that only you can join it.  Use with /permit to allow other users to join your channel.</div>
                <div class="example">/private</div>

                <div class="command">/permit &lt;user&gt;</div>
                <div>Permits a user to join your most recently-created voice channel.</div>
                <div class="example">/permit @roncli</div>

                <div class="section">Events</div>

                <div class="command">/join &lt;event ID&gt;</div>
                <div>Join an event.  You will be listed on the website as attending the event, and you will get a reminder from the bot 30 minutes prior to the event.  Event IDs are listed in the #event-announcements channel on Discord.</div>
                <div class="example">/join 13</div>

                <div class="command">/leave &lt;event ID&gt;</div>
                <div>Leaves an event.  You will no longer be listed on the website as attending the event, and you will not be reminded about the event by the bot.  Event IDs are listed in the #event-announcements channel on Discord.</div>
                <div class="example">/leave 13</div>
            </div>
        `;
    }
}

if (typeof module === "undefined") {
    window.AboutView = AboutView;
} else {
    module.exports = AboutView;
}
