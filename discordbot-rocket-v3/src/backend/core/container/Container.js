// A simple dependency injection container for managing services in the application
// This container allows us to register and retrieve services by name, making it easier to manage dependencies and promote loose coupling between components.
// is used in Bot.js
import CommandHandler from "../handlers/CommandHandler.js";
import EventHandler from "../handlers/EventHandler.js";
import DiscordClient from "../../interfaces/discord/client/DiscordClient.js";
import Logger from "../logger/Logger.js";
import VoiceConnectionService from "../../services/VoiceConnectionService.js";
import AudioSourceResolver from "../../modules/music/services/AudioSourceResolver.js";
import QueueRepository from "../../modules/music/repositories/QueueRepository.js";
import PlaybackService from "../../modules/music/services/PlaybackService.js";

class Container {
  constructor() {
    // Initialize a Map to hold the registered services
    this.services = new Map();
    const client = new DiscordClient();
    this.register("discordClient", client);
    // passes client and logger to the handlers so they can be used in the handlers and commands/events
    const logger = new Logger();
    const voiceService = new VoiceConnectionService({ logger });
    const audioSourceResolver = new AudioSourceResolver({ logger });
    // Create a CommandHandler instance
    const commandHandler = new CommandHandler({
      client,
      logger,
      container: this,
    });
    // Create an EventHandler instance
    const eventHandler = new EventHandler({ client, logger, container: this });
    const queueRepository = new QueueRepository();
    const playbackService = new PlaybackService({
      queueRepository,
      voiceConnectionService: voiceService,
      logger,
    });

    // REGISTERS

    // Register the command and event handlers in the container
    this.register("commandHandler", commandHandler);
    this.register("eventHandler", eventHandler);

    // Register logger for shared services
    this.register("logger", logger);
    // Register the voice connection service
    this.register("voiceService", voiceService);
    // Register the audio source resolver service
    this.register("audioSourceResolver", audioSourceResolver);
    // Register the queue repository
    this.register("queueRepository", queueRepository);
    // Register the playback service
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
