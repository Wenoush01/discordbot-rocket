import { Router } from "express";

import {
  serializeTrack,
  serializePlaybackState,
  serializeQueue,
} from "../../../../modules/music/services/MusicSerializer.js";

function createMusicRouter({ playbackService }) {
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

    // GET /api/music/:guildId/queue - Get current queue for a guild
    router.get("/:guildId/queue", (req, res) => {
      const { guildId } = req.params;
      const tracks = playbackService.getQueueSnapshot(guildId);

      res.json({
        count: tracks.length,
        tracks: serializeQueue(tracks),
      });
    });
  });
  return router;
}

export default createMusicRouter;
