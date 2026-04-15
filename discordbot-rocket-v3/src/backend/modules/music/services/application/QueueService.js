class QueueService {
  constructor({ kazagumoService }) {
    this.kazagumo = kazagumoService.getClient();
  }

  getQueueSnapshot(guildId) {
    const player = this.kazagumo.players.get(guildId);
    if (!player) return [];
    return [...player.queue];
  }
  //TODO: removeFromQueue - remove a specific track from the queue by index
  async removeFromQueue(guildId, position) {
    const player = this.kazagumo.players.get(guildId);
    if (!player) return false;

    await player.queue.remove(position);
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

  //TODO: playNow - grab a specific track from the queue and play it immediately while keeping the queue intact
  async playNow(guildId, position) {
    const player = this.kazagumo.players.get(guildId);
    if (!player) return false;

    await player.play(position);
    await player.queue.remove(position);
    return true;
  }
}

export default QueueService;
