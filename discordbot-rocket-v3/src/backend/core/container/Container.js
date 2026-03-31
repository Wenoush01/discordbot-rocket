// A simple dependency injection container for managing services in the application
// This container allows us to register and retrieve services by name, making it easier to manage dependencies and promote loose coupling between components.
// is used in Bot.js
import CommandHandler from "../handlers/CommandHandler.js";
import EventHandler from "../handlers/EventHandler.js";
import DiscordClient from "../../interfaces/discord/client/DiscordClient.js";
import Logger from "../logger/Logger.js";
import VoiceConnectionService from "../../services/VoiceConnectionService.js";
import AudioSourceResolver from "../../modules/music/services/AudioSourceResolver.js";
import PlaybackService from "../../modules/music/services/PlaybackService.js";
import KazagumoService from "../../modules/music/services/KazagumoService.js";
import KazagumoAudioProvider from "../../modules/music/providers/KazagumoAudioProvider.js";

class Container {
  constructor() {
    // Initialize a Map to hold the registered services
    this.services = new Map();
    const client = new DiscordClient();
    this.register("discordClient", client);
    // passes client and logger to the handlers so they can be used in the handlers and commands/events
    const logger = new Logger();
    this.register("logger", logger);

    // Create a CommandHandler instance
    const commandHandler = new CommandHandler({
      client,
      logger,
      container: this,
    });
    this.register("commandHandler", commandHandler);
    // Create an EventHandler instance
    const eventHandler = new EventHandler({ client, logger, container: this });
    this.register("eventHandler", eventHandler);

    // KAZAGUMO LAVALINK CONFIG OBJECT FROM ENV
    if (!process.env.LAVALINK_PASSWORD) {
      throw new Error("Missing required env var: LAVALINK_PASSWORD");
    }

    const lavalinkConfig = {
      host: process.env.LAVALINK_HOST || "127.0.0.1",
      port: Number(process.env.LAVALINK_PORT) || 2333,
      password: process.env.LAVALINK_PASSWORD,
      secure: String(process.env.LAVALINK_SECURE || "false") === "true",
    };

    //INSTANTIATE KAZAGUMO SERVICE
    const kazagumoService = new KazagumoService({
      client: client.getClient(), // Pass the underlying Discord.js client to KazagumoService
      logger,
      config: {
        lavalink: lavalinkConfig,
      },
    });
    this.register("kazagumoService", kazagumoService);
    kazagumoService.init(); // Initialize Kazagumo and connect to Lavalink

    const voiceService = new VoiceConnectionService({
      logger,
      kazagumoService,
    });
    this.register("voiceService", voiceService);

    const kazagumoAudioProvider = new KazagumoAudioProvider({
      kazagumoService,
      logger,
    });
    this.register("kazagumoAudioProvider", kazagumoAudioProvider);

    const audioSourceResolver = new AudioSourceResolver({
      provider: kazagumoAudioProvider, // Use KazagumoAudioProvider as the source for resolving tracks
      logger,
    });
    this.register("audioSourceResolver", audioSourceResolver);

    // Create a PlaybackService instance
    const playbackService = new PlaybackService({
      voiceConnectionService: voiceService,
      kazagumoService,
      logger,
      audioSourceResolver,
    });
    this.register("playbackService", playbackService);
  }

  // Register a service with a given name
  register(name, instance) {
    this.services.set(name, instance);
  }

  // Retrieve a service by name, throwing an error if it doesn't exist
  get(name) {
    if (!this.services.has(name)) {
      throw new Error(`Service '${name}' not found in container.`);
    } else {
      return this.services.get(name);
    }
  }
}

export default Container;
