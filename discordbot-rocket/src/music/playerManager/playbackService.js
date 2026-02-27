// Refactor: tento modul se stará pouze o logiku přehrávání (play, pause, resume, stop, skip) a správu playerů. Ostatní aspekty jako queue management, stream pipeline a playback settings jsou v samostatných modulech pro lepší modularitu a testovatelnost.
const {
  createAudioPlayer,
  createAudioResource,
  AudioPlayerStatus,
  NoSubscriberBehavior,
  getVoiceConnection,
} = require("@discordjs/voice");

const { getQueue, peekQueue, dequeue, clearQueue } = require("../queueStore");
const { createStreamPipeline } = require("../streamPipeline");
const { getPlaybackSettings } = require("../playbackSettingsStore");

// Refactor: sdílený registry playerů zůstává v playbackService modulu, aby play-flow byl pohromadě.
const players = new Map();

// Refactor: lifecycle playeru + navázání Idle eventu držíme společně s playback tokem.
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

// Refactor: hlavní play-flow (výběr tracku, stream pipeline, subscribe, play) je v jednom modulu.
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

// Refactor: start logika patří ke stejnému playback flow jako playNext.
async function startPlaybackIfIdle(guildId, connection) {
  const queue = getQueue(guildId);
  if (queue.playing) return;

  await playNext(guildId, connection);
}

// Refactor: pause/resume jsou jednoduché operace na playeru
function pausePlayback(guildId) {
  const player = players.get(guildId);
  if (!player) return false;
  return player.pause();
}

function resumePlayback(guildId) {
  const player = players.get(guildId);
  if (!player) return false;
  return player.unpause();
}

// Refactor: skip logika je úzce spojená s přechodem na další skladbu, takže je v playbackControls.
function skipPlayback(guildId) {
  const player = players.get(guildId);
  if (!player) return false;

  // Vynutí přechod na další skladbu v Idle eventu.
  player.stop(true);
  return true;
}

// Refactor: stop logika zahrnuje kompletní teardown playbacku, takže je v playbackControls. Volitelně může zachovat připojení pro rychlejší restart.
function stopPlayback(guildId, options = {}) {
  const { destroyConnection = true } = options;

  const queue = getQueue(guildId);

  if (typeof queue.streamCleanup === "function") {
    queue.streamCleanup();
    queue.streamCleanup = null;
  }

  const player = players.get(guildId);
  if (player) {
    player.stop(true);
  }

  clearQueue(guildId);

  if (destroyConnection) {
    const connection = getVoiceConnection(guildId);
    if (connection) connection.destroy();
  }

  return true;
}

// Refactor: volume control je sloučený do playbackControls pro jednodušší API bez mezivrstev.
function applyVolumeToCurrent(guildId) {
  const player = players.get(guildId);
  const resource = player?.state?.resource;
  if (!resource?.volume) return;

  const settings = getPlaybackSettings(guildId);
  resource.volume.setVolume(settings.volume ?? 1.0);
}

module.exports = {
  getOrCreatePlayer,
  playNext,
  startPlaybackIfIdle,
  applyVolumeToCurrent,
  skipPlayback,
  stopPlayback,
  pausePlayback,
  resumePlayback,
};
