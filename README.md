# six.gg
The website and Discord/Twitch bot for Six Gaming.  You can see this site in action at https://six.gg.

## Features

### Discord Bot
* Announce when Six Gaming streamers are going live.
* Create and manage privacy of voice channels.
* Announce when users create events.
* Manage event attendance.

### Twitch Bot
* Provide chat-based notifications of events on the SixGamingGG Twitch channel such as follows, bits, subscriptions, etc.
* Occasional hosting of a user's stream for registered users streaming to Twitch.

### Website
* Member list from the Discord server.
* OAuth2 registration and login with Discord.
* Basic website profile that displays some information from the user's Discord profile.
* Calendar of events that users can add events to or sign up with.
* Occasional front page feature of a user's stream for registered users streaming to Twitch.

## Version History

### v2.2.5 - 11/24/2021
* Package updates.

### v2.2.4 - 11/21/2021
* Package updates.

### v2.2.3 - 10/22/2021
* Package updates.

### v2.2.2 - 10/6/2021
* Add methods for site owner to refresh Twitch tokens.
* Various package updates.

### v2.2.1 - 10/1/2021
* Added caching for some database calls.
* Fix for Twitch go live notifications.
* Various package updates.

### v2.2.0 - 9/21/2021
* Replaced twitch.js dependency with twurple.
* Removed Twitch webhooks in favor of EventSub.
* Various package updates.

### v2.1.9 - 8/25/2021
* Mount Azure File Storage account if the option is set to do so.
* Update nginx to restart after 1 minute to ensure the first certificate is updated.
* Various package updates.

### v2.1.8 - 4/30/2021
* Fix stream announcing so that it always happens regardless of whether the bot hosts the streamer or not.
* Don't collect MongoDB diagnostic data.
* Add toggle for AppInsights performance metrics.
* Refresh Twitch auth tokens on every restart of the app.
* Various package updates.

### v2.1.7 - 4/10/2021
* Fix Discord OAuth issue.

### v2.1.6 - 4/10/2021
* Debugging for Discord OAuth issue.
* Always use HTTPS protocol in meta tags.
* Rearrange Dockerfiles in such a way to make debugging easier, ie: send over package.json first, then npm install, then send over the rest of the files.
* Fix HTML encoding bug.
* Hang the Modal object on the classes that use it, not on window.
* Replace body-parser with express.
* Fix bug with add event's game combo box.
* Fix bug with templates not being added to window when loaded.
* Add extra debugging to Discord token refresh failures to try to understand them better.
* Various package updates.

### v2.1.5 - 3/30/2021
* Turn off more log colorization for Twitch libraries.
* Various package updates.

### v2.1.4 - 3/26/2021
* Fix bug with attempting to reconnect when the chat is already attempting to reconnect.
* Turn off log colorization for Twitch libraries.
* Various package updates.

### v2.1.3 - 3/20/2021
* Swap order so Twitch is connected to before Discord.
* POSTing invalid JSON now correctly returns a 400.
* Trying to get a member that doesn't exist now correctly returns a 404.
* Various package updates.

### v2.1.2 - 3/6/2021
* Fix bug with refreshing the Discord token for OAuth.
* Add App Insights performance logging metrics.
* Various package updates.

### v2.1.1 - 2/27/2021
* Fix a couple circular references.

### v2.1.0 - 2/27/2021
* Event integration in Discord.  Events are now announced in Discord when they are created.  You can now `!join` events for notifications, and `!leave` events to turn off notifications on a per-event basis.
* The streamer that gets chosen to be on the front page of six.gg is now also hosted on the SixGamingGG Twitch Channel.
* Streams are no longer announced twice.
* Hosted streams are no longer announced at all.  This is a workaround, we are currently prevented from announcing non-hosted streams.
* Excluded tsconfig.json from being served in the public directory.
* Various package updates.

### v2.0.3 - 2/25/2021
* Fix bug with login.
* Improved error handling.
* Get the IP address by trusting the nginx proxy for docker.

### v2.0.2 - 2/25/2021
* Don't setup Application Insights if there is no instrumentation key provided.
* Better handle fail condition for Twitch chat bot setup.
* Various package updates, including changing some core functionality to new packages.

### v2.0.1 - 2/8/2021
* Fix redis caching bug.
* Use logging rather than console.log in startup routine.
* Exceptions are now logged when streamers can't be added or removed.
* Redis is required, so toggling it has been removed.
* Redis now has a 5 minute idle timeout.
* Redis now uses a generic pool for connections.
* Various package updates.

### v2.0.0 - 1/20/2021
* Complete redesign with new features.

### Before v2.0.0
Versions prior to 2.0.0 were not part of an open source project.  six.gg was rewritten from the ground up, and does not use any of the previously open source code.

## License Details
All original code is released without license.  This means that you may not distribute the code without the express written consent of the author.

Because the code resides on GitHub, you are permitted via GitHub's [Terms of Service](https://docs.github.com/en/github/site-policy/github-terms-of-service) to view and fork this repository.
