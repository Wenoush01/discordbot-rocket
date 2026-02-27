const {
  createAudioPlayer,
  createAudioResource,
  AudioPlayerStatus,
  NoSubscriberBehavior,
  getVoiceConnection,
} = require("@discordjs/voice");

const { getQueue, peekQueue, dequeue } = require("./queueStore");
const { createStreamPipeline } = require("../music/streamPipeline");
const { getPlaybackSettings } = require("./playbackSettingsStore");

const players = new Map();
// Funkce pro získání přehrávačče. Pokud neexistuje, vytvoří se nový a uloží do mapy.
function getOrCreatePlayer(guildId) {
  if (players.has(guildId)) return players.get(guildId);

  const player = createAudioPlayer({
    behaviors: {
      noSubscriber: NoSubscriberBehavior.Pause,
    },
  });

  player.on("error", (error) => {
    console.error(`[PLAYER] Chyba přehrávače v guildě ${guildId}:`, error);
  });

  player.on(AudioPlayerStatus.Idle, async () => {
    const queue = getQueue(guildId);

    if (typeof queue.streamCleanup === "function") {
      queue.streamCleanup();
      queue.streamCleanup = null;
    }

    // aktuální track dohrál, takže ho odebereme z fronty

    if (queue.tracks.length > 0) {
      dequeue(guildId);
    }

    const connection = getVoiceConnection(guildId);
    if (!connection) {
      queue.playing = false;
      return;
    }

    await playNext(guildId, connection);
  });

  players.set(guildId, player);
  return player;
}

// Funkce pro přehrání další skladby ve frontě. Pokud není nic ve frontě, přehrávač se zastaví.
async function playNext(guildId, connection) {
  const queue = getQueue(guildId);
  const current = peekQueue(guildId);

  console.log(`[PLAYER] Guild ${guildId} - aktuální skladba:`, current);

  if (!current) {
    queue.playing = false;
    return;
  }

  if (!current.url) {
    console.error(
      `[PLAYER] Guild ${guildId} - aktuální skladba nemá URL:`,
      current,
    );
    dequeue(guildId);
    await playNext(guildId, connection);
    return;
  }

  const player = getOrCreatePlayer(guildId);
  connection.subscribe(player);

  const pipeline = await createStreamPipeline(current.url);
  const resource = createAudioResource(pipeline.stream, {
    inputType: pipeline.inputType,
    inlineVolume: true,
  });

  const settings = getPlaybackSettings(guildId);
  resource.volume.setVolume(settings.volume ?? 1.0);

  queue.streamCleanup = pipeline.cleanup;

  player.play(resource);
  queue.playing = true;
}

// Funkce pro aktualizaci hlasitosti aktuálně přehrávané skladby. Pokud není nic přehráváno, nedělá nic.
function applyVolumeToCurrent(guildId) {
  const player = getOrCreatePlayer(guildId);
  const resource = player.state?.resource;
  if (!resource?.volume) return;

  const settings = getPlaybackSettings(guildId);
  resource.volume.setVolume(settings.volume ?? 1.0);
}

// Funkce pro spuštění přehrávání, pokud není nic přehráváno. Pokud už se něco přehrává, nedělá nic.
async function startPlaybackIfIdle(guildId, connection) {
  const queue = getQueue(guildId);
  if (queue.playing) return; // Už se něco přehrává, takže nic neděláme

  await playNext(guildId, connection);
}

module.exports = {
  getOrCreatePlayer,
  startPlaybackIfIdle,
  playNext,
  applyVolumeToCurrent,
};
