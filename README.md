# RocketBot v3

A modular Discord music bot focused on clean architecture, reliability, and maintainability.

Built with Node.js, Discord.js, and Lavalink/Kazagumo.

## Why This Project Stands Out

- Designed as a real backend architecture project, not a single-file bot
- Uses dependency injection and clear service boundaries
- Event-driven playback flow with queue lifecycle handling
- Graceful shutdown and voice cleanup for safer runtime behavior
- Slash-command based UX with dynamic command discovery

## Core Features

- Music playback from URL or search query
- Queue management with current + upcoming tracks
- Voice join and leave session handling
- Slash commands: ping, help, join, leave, play, queue
- Centralized logging and error handling

## Tech Stack

- Node.js 18+
- Discord.js v14
- Lavalink + Kazagumo
- ESM modules

## Quick Start

1. Install dependencies:

   npm install

2. Register slash commands:

   npm run register:commands

3. Start in development:

   npm run dev

4. Start in production:

   npm start

## Environment Variables

- DISCORD_TOKEN
- DISCORD_CLIENT_ID
- LAVALINK_HOST
- LAVALINK_PORT
- LAVALINK_PASSWORD
- LAVALINK_SECURE

## Recruiter Summary

RocketBot v3 demonstrates backend engineering skills in architecture design, asynchronous event handling, service orchestration, and production-minded reliability patterns.
