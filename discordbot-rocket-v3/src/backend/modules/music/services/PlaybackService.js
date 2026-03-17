import {
  createAudioPlayer,
  createAudioResource,
  AudioPlayerStatus,
  NoSubscriberBehavior,
} from "@discordjs/voice";

class PlaybackService {
  constructor({ queueRepository, voiceConnectionService, logger }) {
    this.queueRepository = queueRepository;
    this.voiceConnectionService = voiceConnectionService;
    this.logger = logger;

    // One AudioPlayer per guild
    this.players = new Map(); // guildId -> AudioPlayer
  }

  async startIfIdle(guildId) {
    const queue = this.queueRepository.getOrCreate(guildId);
    const track = queue.startIfIdle();
    if (!track) return;

    await this.playTrack(guildId, track);
  }

  async playTrack(guildId, track) {
    const connection = this.voiceConnectionService.getConnection(guildId);
    if (!connection) {
      this.logger.error(
        `[PlaybackService] No voice connection for guild ${guildId}`,
      );
      return;
    }

    const player = this.getOrCreatePlayer(guildId);
    connection.subscribe(player);

    try {
      this.logger.info(
        `[PlaybackService] Starting playback of track '${track.title}' in guild ${guildId}`,
      );
      const streamData = await track.streamFactory();
      if (!streamData?.stream) {
        throw new Error("Stream factory did not return a valid stream.");
      }

      const resource = createAudioResource(streamData.stream, {
        inputType: streamData.inputType,
        inlineVolume: true, // Enable volume control
      });

      resource.volume.setVolume(0.5); // Set default volume to 50%
      player.play(resource);
    } catch (error) {
      this.logger.error(
        `[PlaybackService] Error playing track '${track.title}' in guild ${guildId}:`,
        error,
      );
      this.advance(guildId); // Skip to next track on error
    }
  }

  async advance(guildId) {
    const queue = this.queueRepository.getOrCreate(guildId);
    if (!queue) return;

    const next = queue.advance();
    if (!next) {
      this.logger.info(`[PlaybackService] Queue finished in guild ${guildId}`);
      return;
    }

    await this.playTrack(guildId, next);
  }

  // Called by /leave, VoiceStateUpdate, and GracefulShutdown
  stop(guildId) {
    const player = this.players.get(guildId);
    if (player) {
      player.stop(true); // true = force, skips Idle event
      this.players.delete(guildId); // Clean up player instance
    }
    this.queueRepository.clear(guildId); // Clear the queue when leaving
    this.logger.info(
      `[PlaybackService] Stopped playback and cleared queue for guild ${guildId}`,
    );
  }

  // Called by GracefulShutdown ONLY
  stopAll() {
    for (const guildId of [...this.players.keys()]) {
      this.stop(guildId);
    }
  }

  getOrCreatePlayer(guildId) {
    if (this.players.has(guildId)) return this.players.get(guildId);

    const player = createAudioPlayer({
      behaviors: {
        noSubscriber: NoSubscriberBehavior.Pause, // Pause when no listeners, resume when they come back
      },
    });

    player.on(AudioPlayerStatus.Idle, () => {
      this.advance(guildId).catch((error) =>
        this.logger.error(
          `[PlaybackService] Error advancing queue for guild ${guildId}:`,
          error,
        ),
      );
    });

    this.players.set(guildId, player);
    return player;
  }

  isPlaying(guildId) {
    const player = this.players.get(guildId);
    return player?.state?.status === AudioPlayerStatus.Playing;
  }
}

export default PlaybackService;
