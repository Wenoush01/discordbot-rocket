// Fronta pro hudbu, která bude uložena v paměti. Každá položka bude obsahovat informace o skladbě, jako je název, URL, délka atd.

const queues = new Map();

// Funkce pro získání fronty pro danou guildu. Pokud fronta neexistuje, vytvoří se nová.
function getQueue(guildId) {
  if (!queues.has(guildId)) {
    queues.set(guildId, {
      tracks: [],
      playing: false,
      fallbackProcess: null,
    });
  }
  return queues.get(guildId);
}

// Funkce pro přidání skladby do fronty
function enqueue(guildId, track) {
  const queue = getQueue(guildId);
  queue.tracks.push(track);
  return queue;
}

// Funkce pro odebrání první skladby z fronty a její vrácení
function dequeue(guildId) {
  const queue = getQueue(guildId);
  return queue.tracks.shift() ?? null;
}

// Funkce pro zobrazení první skladby ve frontě bez jejího odebrání
function peekQueue(guildId) {
  const queue = getQueue(guildId);
  return queue.tracks[0] ?? null;
}

// Funkce pro vyčištění fronty a resetování stavu přehrávání
function clearQueue(guildId) {
  const queue = getQueue(guildId);

  if (typeof queue.streamCleanup === "function") {
    queue.streamCleanup();
  }

  queue.tracks = [];
  queue.playing = false;
  return queue;
}

module.exports = {
  getQueue,
  enqueue,
  dequeue,
  peekQueue,
  clearQueue,
};
