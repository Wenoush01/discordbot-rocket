class QueueService {
  constructor({ kazagumoService }) {
    this.kazagumo = kazagumoService.getClient();
  }

  getQueueSnapshot(guildId) {
    const player = this.kazagumo.players.get(guildId);
    if (!player) return [];
    return [...player.queue];
  }

  // Paginate through the queue if it's too long to display at once.
  getPaginatedQueue(guildId, page = 1, pageSize = 10) {
    const queue = this.getQueueSnapshot(guildId);
    const totalPages = Math.max(1, Math.ceil(queue.length / pageSize));
    const safePage = Math.min(Math.max(1, page), totalPages);

    const start = (safePage - 1) * pageSize;
    const tracks = queue.slice(start, start + pageSize);

    return {
      tracks,
      currentPage: safePage,
      totalPages,
      hasPrev: safePage > 1,
      hasNext: safePage < totalPages,
    };
  }

  async nextPage(guildId, currentPage, pageSize = 10) {
    const { totalPages } = this.getPaginatedQueue(
      guildId,
      currentPage,
      pageSize,
    );
    const nextPage = currentPage < totalPages ? currentPage + 1 : 1;
    return this.getPaginatedQueue(guildId, nextPage, pageSize);
  }

  async previousPage(guildId, currentPage, pageSize = 10) {
    const { totalPages } = this.getPaginatedQueue(
      guildId,
      currentPage,
      pageSize,
    );
    const previousPage = currentPage > 1 ? currentPage - 1 : totalPages;
    return this.getPaginatedQueue(guildId, previousPage, pageSize);
  }

  async refreshQueue(guildId) {
    const player = this.kazagumo.players.get(guildId);
    if (!player) return [];
    await player.queue.refresh();
    return [...player.queue];
  }

  //remove a specific track from the queue by index
  async removeFromQueue(guildId, position) {
    const player = this.kazagumo.players.get(guildId);
    if (!player) return false;

    await player.queue.remove(position);
    return true;
  }

  //skip to a specific track in the queue, not just the next one. Kazagumo supports it but it needs to be exposed in the API and UI first.
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

  //grab a specific track from the queue and play it immediately while keeping the queue intact
  async playNow(guildId, position) {
    const player = this.kazagumo.players.get(guildId);
    if (!player) return false;

    await player.play(position);
    await player.queue.remove(position);
    return true;
  }
}

export default QueueService;
