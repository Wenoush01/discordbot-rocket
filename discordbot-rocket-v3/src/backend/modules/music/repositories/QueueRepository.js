import Queue from "../domain/Queue.js";

class QueueRepository {
  constructor() {
    this.queues = new Map(); // guildId -> Queue
  }

  // Get the queue for a guild, if it doesn't exist, create a new one and return it
  getOrCreate(guildId) {
    if (!this.queues.has(guildId)) {
      this.queues.set(guildId, new Queue());
    }
    return this.queues.get(guildId);
  }

  get(guildId) {
    return this.queues.get(guildId) ?? null;
  }

  has(guildId) {
    return this.queues.has(guildId);
  }

  // Clear the queue for a guild - does not delete the queue itself, just clears its contents
  clear(guildId) {
    this.queues.get(guildId)?.clear();
  }

  // Delete the queue for a guild - removes it from entirely
  delete(guildId) {
    this.queues.delete(guildId);
  }
}

export default QueueRepository;
