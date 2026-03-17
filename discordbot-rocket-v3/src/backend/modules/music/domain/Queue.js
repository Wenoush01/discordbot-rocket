class Queue {
  constructor() {
    this.current = null; // Currently playing track
    this.tracks = []; // Array of upcoming tracks
  }

  // Add a track to the end of the queue
  enqueue(track) {
    this.tracks.push(track);
    return this.tracks.length;
  }

  // Called when nothing is playing - moves the first track from the queue to current and returns it
  startIfIdle() {
    if (this.current || this.tracks.length === 0) return this.current;
    this.current = this.tracks.shift();
    return this.current;
  }

  // Called when the current track finishes - moves the next track from the queue to current and returns it
  advance() {
    this.current = this.tracks.length > 0 ? this.tracks.shift() : null;
    return this.current;
  }

  getCurrent() {
    return this.current;
  }

  isEmpty() {
    return !this.current && this.tracks.length === 0;
  }

  // Returns upcoming tracks for display - up to "limit" - configurable
  listUpcoming(limit = 10) {
    return this.tracks.slice(0, limit);
  }

  remainingAfter(limit = 10) {
    return Math.max(0, this.tracks.length - limit);
  }

  totalDurationSeconds() {
    const curr = this.current?.duration ?? 0;
    return this.tracks.reduce((sum, t) => sum + (t.duration || 0), curr);
  }

  clear() {
    this.current = null;
    this.tracks = [];
  }
}

export default Queue;
