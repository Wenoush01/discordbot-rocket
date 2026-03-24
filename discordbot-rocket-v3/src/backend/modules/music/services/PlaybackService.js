import Track from "../domain/Track.js";

class PlaybackService {
  constructor({
    queueRepository,
    voiceConnectionService: voiceService,
    kazagumoService,
    logger,
    audioSourceResolver,
  }) {
    this.queueRepository = queueRepository;
    this.voiceConnectionService = voiceService;
    this.kazagumoService = kazagumoService;
    this.logger = logger;
    this.audioSourceResolver = audioSourceResolver;
    this.kazagumo = kazagumoService.getClient();
    this.registerKazagumoEvents();
  }

  async enqueueAndPlayIfIdle(guildId, input) {
    const payload = await this.audioSourceResolver.resolve(input);
    const track = new Track(payload);

    const queue = this.queueRepository.getOrCreate(guildId);
    const wasIdle = !queue.getCurrent();
    const queuePos = queue.enqueue(track);

    if (wasIdle) {
      await this.startIfIdle(guildId);
      return { status: "started", track };
    }
    return { status: "queued", track, queuePos };
  }

  async startIfIdle(guildId) {
    const queue = this.queueRepository.getOrCreate(guildId);
    const track = queue.startIfIdle();
    if (!track) return;

    await this.playTrack(guildId, track);
  }

  async playTrack(guildId, track) {
    const voiceChannelId = this.voiceConnectionService.getChannelId(guildId);
    if (!voiceChannelId) {
      this.logger.error(
        `[PlaybackService] No voice channel selected for guild ${guildId}`,
      );
      return;
    }

    try {
      let player = this.kazagumo.players.get(guildId);

      if (!player) {
        player = await this.kazagumo.createPlayer({
          guildId,
          voiceId: voiceChannelId,
          textId: undefined,
          deaf: true,
          volume: 50,
        });
      } else if (player.voiceId !== voiceChannelId) {
        player.setVoiceChannel(voiceChannelId);
      }

      await player.play(track.kazagumoTrack);
    } catch (error) {
      this.logger.error(
        `[PlaybackService] Error playing track '${track.title}' in guild ${guildId}:`,
        error,
      );
      this.advance(guildId); // Skip to next track on error
    }
  }

  async advance(guildId) {
    const queue = this.queueRepository.get(guildId);
    if (!queue) return;

    const next = queue.advance();
    if (!next) {
      this.logger.info(`[PlaybackService] Queue finished in guild ${guildId}`);
      return;
    }
    this.logger.info(
      `[PlaybackService] Advancing to next track '${next.title}'`,
    );
    await this.playTrack(guildId, next);
  }

  // Called by /leave, VoiceStateUpdate, and GracefulShutdown
  async stop(guildId) {
    const player = this.kazagumo.players.get(guildId);
    if (player) {
      await player.destroy();
    }
    this.queueRepository.clear(guildId); // Clear the queue when leaving
    this.logger.info(
      `[PlaybackService] Stopped playback and cleared queue for guild ${guildId}`,
    );
  }

  // Called by GracefulShutdown ONLY
  async stopAll() {
    for (const guildId of [...this.kazagumo.players.keys()]) {
      await this.stop(guildId);
    }
  }

  isSameTrack(current, ended) {
    if (!current || !ended) return false;

    return (
      current.url === (ended.uri || ended.url || null) &&
      current.title === ended.title
    );
  }

  registerKazagumoEvents() {
    this.kazagumo.on("playerEnd", (player, track, payload) => {
      const queue = this.queueRepository.get(player.guildId);
      const current = queue?.getCurrent();

      const endedMatchesCurrent = this.isSameTrack(current, track);

      this.logger.info("[PlaybackService] PlayerEnd", {
        guildId: player.guildId,
        endedTitle: track?.title ?? null,
        currentTitle: queue?.getCurrent()?.title ?? null,
        endedMatchesCurrent,
        payload,
      });

      if (!queue || !endedMatchesCurrent) {
        this.logger.info(
          `[PlaybackService] Ignoring stale playerEnd event for guild ${player.guildId}`,
        );
        return;
      }

      const reason = payload?.reason ?? payload?.type ?? null;

      const shouldAdvance =
        reason === "finished" ||
        reason === "loadFailed" ||
        reason === "stopped";

      if (!shouldAdvance) {
        this.logger.info(
          `[PlaybackService] Ignoring non-finished playerEnd event for guild ${player.guildId}`,
        );
        return;
      }

      this.advance(player.guildId).catch((error) =>
        this.logger.error(
          `[PlaybackService] Error advancing queue after playerEnd in guild ${player.guildId}:`,
          error,
        ),
      );
    });

    this.logger.info("[PlaybackService] Registered Kazagumo event handlers");

    this.kazagumo.on("playerStart", (player, track) => {
      this.logger.info(
        `[PlaybackService] Kazagumo player started track '${track.title}' in guild ${player.guildId}`,
      );
    });

    this.kazagumo.on("playerError", (player, error) => {
      this.logger.error(
        `[PlaybackService] Kazagumo player error in guild ${player.guildId}:`,
        error,
      );
    });
  }
}

export default PlaybackService;
