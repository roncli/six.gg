# Copilot Instructions for six.gg

## Architecture Overview
six.gg is a multi-faceted application that integrates a website, a Discord bot, and a Twitch bot. It is designed to support the Six Gaming community by providing features such as event management, member profiles, and live notifications. The project is structured into several Dockerized services, including `nginx`, `logging`, `node`, and `certbot`. Key components include:

- **Discord Bot**: Manages voice channels, event announcements, and attendance.
- **Twitch Bot**: Handles chat-based notifications and stream hosting.
- **Website**: Provides user profiles, event calendars, and OAuth2 login via Discord.
- **Database**: MongoDB is used for persistent storage, with lru-cache for caching.

## Developer Workflow
### Building and Running
- Use `docker-compose up` to start all services.
- Individual services can be started using their respective `start.sh` scripts.

### Debugging
- Logs are managed by the `logging` service. Check `logging/index.js` for log parsing and AppInsights integration.
- Use `console.log` or the logging utility for debugging.

## Project Conventions & Patterns
- **Event-Driven Architecture**: Discord and Twitch bots rely on event listeners (e.g., `src/listeners/discord.js`).
- **Modular Design**: Code is organized into feature-specific directories (e.g., `src/database`, `src/discord`).
- **Environment Variables**: Secrets are stored in the `secrets/` directory and loaded at runtime.
- **TypeScript**: Type definitions are provided in `types/` for better code clarity.  However, the main codebase is in JavaScript, and will remain that way.
- **Testing**: No formal test suite is present; manual testing is expected.

## Key Files & Directories
- `src/`: Core application logic.
  - `src/database/`: MongoDB models and queries.
  - `src/discord/`: Discord bot commands and event handling.
  - `src/twitch/`: Twitch bot functionality.
- `public/`: Static assets for the website.
- `secrets/`: Contains sensitive configuration files.
- `docker-compose.yml`: Defines the Docker services.
- `README.md`: High-level project overview and version history.

## Integration Points
- **Discord API**: Used for bot commands and user authentication.
- **Twitch API**: Handles event subscriptions and chat interactions.
- **MongoDB**: Persistent storage for user data and events.
- **Application Insights**: Integrated for performance monitoring and logging.

## License
All original code is released without a license. Redistribution requires express written consent from the author. Refer to the [GitHub Terms of Service](https://docs.github.com/en/github/site-policy/github-terms-of-service) for viewing and forking permissions.

---

For questions or issues, see the [README.md](../README.md) or [GitHub Issues](https://github.com/roncli/six.gg/issues).
