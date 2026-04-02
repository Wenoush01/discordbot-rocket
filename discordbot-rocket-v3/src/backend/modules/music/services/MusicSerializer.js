function serializeTrack(kazagumoTrack) {
  if (!kazagumoTrack) return null;

  const durationMs = kazagumoTrack.length ?? 0;
  const durationSec = Math.floor(durationMs / 1000);
  const mins = Math.floor(durationSec / 60);
  const secs = String(durationSec % 60).padStart(2, "0");

  return {
    title: kazagumoTrack.title ?? "Unknown",
    author: kazagumoTrack.author ?? "Unknown",
    url: kazagumoTrack.uri ?? null,
    thumbnail: kazagumoTrack.thumbnail ?? null,
    durationMs,
    durationFormatted: `${mins}:${secs}`,
    source: kazagumoTrack.sourceName ?? "unknown",
  };
}

function serializePlaybackState(snapshot) {
  if (!snapshot) return null;

  return {
    playing: snapshot.playing,
    paused: snapshot.paused,
    volume: snapshot.volume,
    loop: snapshot.loop,
    positionMs: snapshot.position ?? 0,
  };
}

function serializeQueue(kazagumoTracks) {
  return kazagumoTracks.map((t, index) => ({
    index,
    ...serializeTrack(t),
  }));
}

export { serializeTrack, serializePlaybackState, serializeQueue };
