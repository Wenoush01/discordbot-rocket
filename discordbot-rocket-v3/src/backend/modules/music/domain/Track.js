import crypto from "crypto";

class Track {
  constructor({ id, title, url, duration, thumbnail, source, kazagumoTrack }) {
    if (!title) throw new Error("Track title required");
    if (!url) throw new Error("Track url required");
    if (!kazagumoTrack) throw new Error("Kazagumo track object required");

    this.id = id ?? crypto.randomUUID(); // Unique identifier for the track
    this.title = title;
    this.url = url;
    this.duration = Number(duration || 0); // Duration in seconds
    this.thumbnail = thumbnail || null;
    this.source = source ?? "unknown";
    this.kazagumoTrack = kazagumoTrack || null; // Store the original Kazagumo track object for later use

    Object.freeze(this); // Make the track instance immutable
  }

  get formattedDuration() {
    const mins = Math.floor(this.duration / 60);
    const secs = String(this.duration % 60).padStart(2, "0");
    return `${mins}:${secs}`;
  }
}

export default Track;
