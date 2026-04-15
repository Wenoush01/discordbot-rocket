import { request } from "http";
import Track from "../../domain/Track.js";

class PlaybackService {
  constructor({
    voiceConnectionService: voiceService,
    kazagumoService,
    logger,
    audioSourceResolver,
    config,
  }) {
    this.voiceConnectionService = voiceService;
    this.kazagumoService = kazagumoService;
    this.logger = logger;
    this.audioSourceResolver = audioSourceResolver;
    this.kazagumo = kazagumoService.getClient();
    this.registerKazagumoEvents();
    this.defaultVolume = config.music.defaultVolume;
  }

  // Be careful to stay domain-focused. AI tried to refactor it to implement NowPlayingCard logic here but that would be a violation of SRP. PlaybackService should only be responsible for controlling playback and queue, not how the UI is updated.
  async enqueueAndPlayIfIdle(guildId, input) {
    const payload = await this.audioSourceResolver.resolve(input);
    const voiceChannelId = this.voiceConnectionService.getChannelId(guildId);
    if (!voiceChannelId) {
      throw new Error("You must be in a voice channel to play music.");
    }

    // every instance will start off with 10
    let player = this.kazagumo.players.get(guildId);
    if (!player) {
      player = await this.kazagumo.createPlayer({
        guildId,
        voiceId: voiceChannelId,
        textId: undefined,
        deaf: true,
        volume: this.defaultVolume,
      });
    } else if (player.voiceChannelId !== voiceChannelId) {
      player.setVoiceChannel(voiceChannelId);
    }

    // Single track vs playlist (PLAYLIST TYPE)
    if (payload.type === "PLAYLIST") {
      // Add all tracks in playlist to queue at once
      player.queue.add(payload.tracks);

      //metadata of playlist for now playing card
      const playlistName =
        payload.playlistName ?? payload.title ?? "Unknown Playlist";
      player.data?.set?.("recentlyAdded", {
        type: "playlist",
        title:
          "Playlist" + playlistName + " (" + payload.tracks.length + " tracks)",
        playlistName,
        trackCount: payload.tracks.length,
        thumbnail: payload.tracks?.[0]?.thumbnail ?? null,
        addedAt: Date.now(),
      });

      const wasIdle = !player.playing && !player.paused;
      if (wasIdle) {
        await player.play();
        return {
          status: "started",
          kind: "playlist",
          playlistName: payload.playlistName,
          trackCount: payload.tracks.length,
          title: payload.title,
        };
      }

      return {
        status: "queued",
        kind: "playlist",
        playlistName: payload.playlistName,
        trackCount: payload.tracks.length,
        title: payload.title,
      };
    } else {
      // Single track (TRACK TYPE)
      const track = new Track(payload);
      player.queue.add(track.kazagumoTrack);

      //metadata of singular track for now playing card
      player.data?.set?.("recentlyAdded", {
        type: "track",
        title: track.title,
        duration: track.duration ?? 0,
        url: track.url ?? null,
        thumbnail: track.thumbnail ?? null,
        addedAt: Date.now(),
      });

      const wasIdle = !player.playing && !player.paused;
      if (wasIdle) {
        await player.play();
        return { status: "started", kind: "track", track };
      }

      const queuePos = Array.isArray(player.queue)
        ? player.queue.length
        : undefined;
      return { status: "queued", kind: "track", track, queuePos };
    }
  }

  // Similarly to pause, there is a delay of few seconds before the track actually skips, might be Kazagumo/Lavalink issue. Needs investigation.
  skip(guildId) {
    const player = this.kazagumo.players.get(guildId);
    if (!player || (!player.playing && !player.paused)) return false;

    player.skip();
    return true;
  }

  //TODO: skipTo - skip to a specific track in the queue, not just the next one. Kazagumo supports it but it needs to be exposed in the API and UI first.

  async skipTo(guildId, position) {
    const player = this.kazagumo.players.get(guildId);
    if (!player) return false;

    // Skip all tracks before the target position
    for (let i = 0; i < position; i++) {
      if (player.queue.length > 0) {
        player.skip();
      }
    }

    return true;
  }
  //TODO: removeFromQueue - remove a specific track from the queue by index
  async removeFromQueue(guildId, position) {
    const player = this.kazagumo.players.get(guildId);
    if (!player) return false;

    await player.queue.remove(position);
    return true;
  }

  //TODO: playNow - grab a specific track from the queue and play it immediately while keeping the queue intact
  async playNow(guildId, position) {
    const player = this.kazagumo.players.get(guildId);
    if (!player) return false;

    await player.play(position);
    await player.queue.remove(position);
    return true;
  }

  //Pause is way too slow, there is a delay of few seconds before the player actually pauses. Might be Kazagumo/Lavalink issue, needs investigation. Resume is not affected.
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

  // SetVolume should not directly change the defaultVolume - it should modify it by the input in percentage. Example: defaultVolume is 15, user inputs 50, the resulting volume should be 7.5 (50% of 15). If user inputs 100, the resulting volume should be 15 (100% of 15)
  // Currently bots default volume is 2 - that is not intended, should be 100. Needs investigation.
  async setVolume(guildId, volume) {
    const player = this.kazagumo.players.get(guildId);
    if (volume < 1 || volume > 200) {
      return interaction.reply({
        content: "Volume must be between 1 and 200.",
        flags: MessageFlags.Ephemeral,
      });
    }
    if (!player) return false;
    const requestedPercent = Math.max(1, Math.min(100, Number(volume)));

    await player.setVolume(requestedPercent);
    player.data?.set?.("volumePercent", requestedPercent);
    this.logger.info(
      `[PlaybackService] Set volume for guild ${guildId} to ${requestedPercent} (input: ${volume}%)`,
    );
    return true;
  }

  async getVolume(guildId) {
    const player = this.kazagumo.players.get(guildId);
    if (!player) return null;
    return player.volume;
  }

  // Similarly to pause, there is a delay of few seconds before the loop mode is applied, might be Kazagumo/Lavalink issue. Needs investigation.
  async clearQueue(guildId) {
    const player = this.kazagumo.players.get(guildId);
    if (!player) return false;
    player.queue.clear();
    // stop the current track if playing too, clear it from the player
    if (player.playing || player.paused) {
      await player.skip();
    }
    player.data?.delete?.("recentlyAdded");

    return true;
  }

  async setLoop(guildId, mode) {
    const player = this.kazagumo.players.get(guildId);
    if (!player) return false;
    player.setLoop(mode);
    return true;
  }

  //API Server helpers and stuff
  getPlayer(guildId) {
    return this.kazagumo.players.get(guildId) ?? null;
  }

  getNowPlaying(guildId) {
    return this.kazagumo.players.get(guildId)?.queue?.current ?? null;
  }

  getQueueSnapshot(guildId) {
    const player = this.kazagumo.players.get(guildId);
    if (!player) return [];
    return [...player.queue];
  }

  getPlaybackSnapshot(guildId) {
    const player = this.kazagumo.players.get(guildId);
    if (!player) return null;
    return {
      playing: player.playing,
      paused: player.paused,
      volume: player.volume,
      loop: player.loop,
      position: player.position,
    };
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
