import { Router } from "express";

import {
  serializeTrack,
  serializePlaybackState,
  serializeQueue,
} from "../../../../modules/music/services/MusicSerializer.js";

function createMusicRouter({ playbackService, nowPlayingCardService }) {
  const router = Router();

  //GET /api/music/:guildId/state - Get current playback state and now playing track for a guild
  router.get("/:guildId/state", (req, res) => {
    const { guildId } = req.params;
    const snapshot = playbackService.getPlaybackSnapshot(guildId);
    const nowPlaying = playbackService.getNowPlaying(guildId);

    if (!snapshot) {
      return res.json({
        active: false,
        state: null,
        nowPlaying: null,
      });
    }

    res.json({
      active: true,
      state: serializePlaybackState(snapshot),
      nowPlaying: serializeTrack(nowPlaying),
    });
  });

  // GET /api/music/:guildId/queue - Get current queue for a guild
  router.get("/:guildId/queue", (req, res) => {
    const { guildId } = req.params;
    const tracks = playbackService.getQueueSnapshot(guildId);

    res.json({
      count: tracks.length,
      tracks: serializeQueue(tracks),
    });
  });

  // POST APIs

  // Pause
  router.post("/:guildId/pause", async (req, res) => {
    const { guildId } = req.params;
    try {
      const ok = playbackService.pause(guildId);
      if (!ok) {
        return res.status(404).json({ ok: false, message: "No active player" });
      }
      await nowPlayingCardService.refreshGuild(guildId);
      res.status(200).json({ ok: true, action: "paused" });
    } catch (err) {
      console.error(err);
      res.sendStatus(400);
    }
  });

  // Resume
  router.post("/:guildId/resume", async (req, res) => {
    const { guildId } = req.params;
    try {
      const ok = playbackService.resume(guildId);
      if (!ok) {
        return res.status(404).json({ ok: false, message: "No active player" });
      }
      await nowPlayingCardService.refreshGuild(guildId);
      res.status(200).json({ ok: true, action: "resumed" });
    } catch (err) {
      console.error(err);
      res.sendStatus(400);
    }
  });

  // Skip
  router.post("/:guildId/skip", async (req, res) => {
    const { guildId } = req.params;
    try {
      const ok = playbackService.skip(guildId);
      if (!ok) {
        return res.status(404).json({ ok: false, message: "No active player" });
      }
      await nowPlayingCardService.refreshGuild(guildId);
      res.status(200).json({ ok: true, action: "skipped" });
    } catch (err) {
      console.error(err);
      res.sendStatus(400);
    }
  });

  // Clear queue
  router.post("/:guildId/queue/clear", async (req, res) => {
    const { guildId } = req.params;
    try {
      const ok = await playbackService.clearQueue(guildId);
      if (!ok) {
        return res.status(404).json({ ok: false, message: "No active player" });
      }
      await nowPlayingCardService.refreshGuild(guildId);

      res.status(200).json({ ok: true, action: "cleared" });
    } catch (err) {
      console.error(err);
      res.sendStatus(400);
    }
  });

  // POST APIs with parameters

  // Play a track
  router.post("/:guildId/play", async (req, res) => {
    const { guildId } = req.params;
    const { query } = req.body;
    try {
      const ok = await playbackService.play(guildId, query);
      if (!ok) {
        return res.status(404).json({ ok: false, message: "No active player" });
      }
      await nowPlayingCardService.refreshGuild(guildId);

      res.status(200).json({ ok: true, action: "played" });
    } catch (err) {
      console.error(err);
      res.sendStatus(400);
    }
  });

  //Volume
  router.post("/:guildId/volume", async (req, res) => {
    const { guildId } = req.params;
    const { volume } = req.body;
    try {
      const ok = await playbackService.setVolume(guildId, volume);
      if (!ok) {
        return res.status(404).json({ ok: false, message: "No active player" });
      }
      await nowPlayingCardService.refreshGuild(guildId);
      res.status(200).json({ ok: true, action: "volume_set" });
    } catch (err) {
      console.error(err);
      res.sendStatus(400);
    }
  });

  // Loop mode - to be implemented in the future when loop mode is supported

  return router;
}

export default createMusicRouter;
