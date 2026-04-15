// A simple dependency injection container for managing services in the application
// This container allows us to register and retrieve services by name, making it easier to manage dependencies and promote loose coupling between components.
// is used in Bot.js
import CommandHandler from "../handlers/CommandHandler.js";
import EventHandler from "../handlers/EventHandler.js";
import DiscordClient from "../../interfaces/discord/client/DiscordClient.js";
import Logger from "../logger/Logger.js";
import ConfigLoader from "../config/ConfigLoader.js";
import VoiceConnectionService from "../../services/VoiceConnectionService.js";
import AudioSourceResolver from "../../modules/music/services/infrastructure/AudioSourceResolver.js";
import PlaybackService from "../../modules/music/services/application/PlaybackService.js";
import KazagumoService from "../../modules/music/services/infrastructure/KazagumoService.js";
import KazagumoAudioProvider from "../../modules/music/providers/KazagumoAudioProvider.js";
import NowPlayingCardService from "../../modules/music/services/discord/NowPlayingCardService.js";
import NowPlayingSyncService from "../../modules/music/services/discord/NowPlayingSyncService.js";
import MusicControlValidator from "../../modules/music/services/discord/MusicControlValidator.js";
import MusicInteractionService from "../../modules/music/services/discord/MusicInteractionService.js";
import VoiceCueService from "../../modules/music/services/application/VoiceCueService.js";
// Server imports
import createApiServer from "../../interfaces/api/ApiServer.js";

class Container {
  constructor() {
    // Initialize a Map to hold the registered services
    this.services = new Map();
    const client = new DiscordClient();
    this.register("discordClient", client);
    // passes client and logger to the handlers so they can be used in the handlers and commands/events
    const logger = new Logger();
    this.register("logger", logger);

    // Initialize Config Loader and register the loaded config
    const config = ConfigLoader.load();
    this.register("config", config);

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

    // KAZAGUMO LAVALINK FROM CONFIG LOADER
    const lavalinkConfig = config.lavalink;
    if (!lavalinkConfig.password) {
      throw new Error("Missing required env var: LAVALINK_PASSWORD");
    }

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

    // Create a VoiceCueService instance
    const voiceCueService = new VoiceCueService({
      logger,
      kazagumoService,
      config,
      audioSourceResolver,
    });
    this.register("voiceCueService", voiceCueService);

    const voiceService = new VoiceConnectionService({
      logger,
      kazagumoService,
      voiceCueService,
      config,
    });
    this.register("voiceService", voiceService);
    // Create a NowPlayingCardService instance
    const nowPlayingCardService = new NowPlayingCardService({
      client: client.getClient(),
      kazagumoService,
      logger,
    });
    this.register("nowPlayingCardService", nowPlayingCardService);

    // Create a PlaybackService instance
    const playbackService = new PlaybackService({
      voiceConnectionService: voiceService,
      kazagumoService,
      logger,
      audioSourceResolver,
      config,
    });
    this.register("playbackService", playbackService);

    // Create a MusicControlValidator instance
    const musicControlValidator = new MusicControlValidator({
      kazagumoService,
    });
    this.register("musicControlValidator", musicControlValidator);

    // Create a MusicInteractionService instance
    const musicInteractionService = new MusicInteractionService({
      playbackService,
      musicControlValidator,
      nowPlayingCardService,
      logger,
    });
    this.register("musicInteractionService", musicInteractionService);

    //  Create NowPlayingSyncService instance and call init() once
    const nowPlayingSyncService = new NowPlayingSyncService({
      kazagumoService: this.get("kazagumoService"),
      nowPlayingCardService: this.get("nowPlayingCardService"),
      logger: this.get("logger"),
    });

    //Initialize API Server and register it
    const apiServer = createApiServer({
      config,
      logger,
      playbackService,
      nowPlayingCardService,
    });
    this.register("apiServer", apiServer);

    nowPlayingSyncService.init();
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
