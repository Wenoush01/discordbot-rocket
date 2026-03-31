import Track from "../domain/Track.js";

class PlaybackService {
  constructor({
    voiceConnectionService: voiceService,
    kazagumoService,
    logger,
    audioSourceResolver,
  }) {
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
    const voiceChannelId = this.voiceConnectionService.getChannelId(guildId);
    if (!voiceChannelId) {
      throw new Error("You must be in a voice channel to play music.");
    }

    let player = this.kazagumo.players.get(guildId);
    if (!player) {
      player = await this.kazagumo.createPlayer({
        guildId,
        voiceId: voiceChannelId,
        textId: undefined,
        deaf: true,
        volume: 50,
      });
    } else if (player.voiceChannelId !== voiceChannelId) {
      player.setVoiceChannel(voiceChannelId);
    }

    player.queue.add(track.kazagumoTrack);

    const wasIdle = !player.playing && !player.paused;
    if (wasIdle) {
      await player.play();
      return { status: "started", track };
    }

    const queuePos = Array.isArray(player.queue)
      ? player.queue.length
      : undefined;
    return { status: "queued", track, queuePos };
  }

  async skip(guildId) {
    const player = this.kazagumo.players.get(guildId);
    if (!player || (!player.playing && !player.paused)) return false;

    await player.skip();
    return true;
  }

  pause(guildId) {
    const player = this.kazagumo.players.get(guildId);
    player?.pause(true);
    if (!player) return false;
    else if (!player.paused) return false;
    return true;
  }

  resume(guildId) {
    const player = this.kazagumo.players.get(guildId);
    player?.pause(false);
    if (!player) return false;
    else if (player.paused) return false;
    return true;
  }

  // Called by /leave, VoiceStateUpdate, and GracefulShutdown
  async stop(guildId) {
    const player = this.kazagumo.players.get(guildId);
    if (player) {
      await player.destroy();
    }
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

  //Logs only - no logic
  registerKazagumoEvents() {
    this.kazagumo.on("playerStart", (player, track) => {
      this.logger.info(
        `[Kazagumo Event] playerStart - Guild: ${player.guildId}, Track: ${track.title}`,
      );
    });

    this.kazagumo.on("playerEnd", (player, track, payload) => {
      const reason = payload?.reason ?? payload?.type ?? null;
      const normalized = String(reason || "").toLowerCase();
      // If reason is missing, still advance
      const shouldAdvance =
        !reason || ["finished", "loadfailed", "stopped"].includes(normalized);

      this.logger.info(
        `[Kazagumo Event] playerEnd - Guild: ${player.guildId}, Track: ${track.title}, Reason: ${reason}, Should Advance: ${shouldAdvance}`,
      );
    });

    this.kazagumo.on("playerError", (player, error) => {
      this.logger.error(
        `[Kazagumo Event] playerError - Guild: ${player.guildId}, Error: ${error instanceof Error ? error.message : String(error)}`,
      );
    });
  }
}

export default PlaybackService;
