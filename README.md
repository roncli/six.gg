# six.gg

The website and Discord/Twitch bot for Six Gaming.  You can see this site in action at https://six.gg.

## Features

### Discord Bot

* Create and manage privacy of voice channels

### Twitch Bot

* Provide chat-based notifications of events on the SixGamingGG Twitch channel such as follows, bits, subscriptions, etc.

### Website

* Member list from the Discord server
* OAuth2 registration and login with Discord
* Basic website profile that displays some information from the user's Discord profile
* Calendar of events that users can add events to or sign up with
* Occasional front page feature of their stream for registered users streaming to Twitch

## Version History

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
