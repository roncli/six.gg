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

### 2.1.2 - 3/6/2021
* Fix bug with refreshing the Discord token for OAuth.
* Add App Insights performance logging metrics.
* Various package updates.

### 2.1.1 - 2/27/2021
* Fix a couple circular references.

### 2.1.0 - 2/27/2021
* Event integration in Discord.  Events are now announced in Discord when they are created.  You can now `!join` events for notifications, and `!leave` events to turn off notifications on a per-event basis.
* The streamer that gets chosen to be on the front page of six.gg is now also hosted on the SixGamingGG Twitch Channel.
* Streams are no longer announced twice.
* Hosted streams are no longer announced at all.  This is a workaround, we are currently prevented from announcing non-hosted streams.
* Excluded tsconfig.json from being served in the public directory.
* Various package updates.

### 2.0.3 - 2/25/2021
* Fix bug with login.
* Improved error handling.
* Get the IP address by trusting the nginx proxy for docker.

### 2.0.2 - 2/25/2021
* Don't setup Application Insights if there is no instrumentation key provided.
* Better handle fail condition for Twitch chat bot setup.
* Various package updates, including changing some core functionality to new packages.

### 2.0.1 - 2/8/2021
* Fix redis caching bug.
* Use logging rather than console.log in startup routine.
* Exceptions are now logged when streamers can't be added or removed.
* Redis is required, so toggling it has been removed.
* Redis now has a 5 minute idle timeout.
* Redis now uses a generic pool for connections.
* Various package updates.

### 2.0.0 - 1/20/2021
* Complete redesign with new features.

### Before 2.0.0
Versions prior to 2.0.0 were not part of an open source project.  six.gg was rewritten from the ground up, and does not use any of the previously open source code.

## License Details
All original code is released without license.  This means that you may not distribute the code without the express written consent of the author.

Because the code resides on GitHub, you are permitted via GitHub's [Terms of Service](https://docs.github.com/en/github/site-policy/github-terms-of-service) to view and fork this repository.
