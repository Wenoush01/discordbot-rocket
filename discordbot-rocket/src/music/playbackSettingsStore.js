const settingsByGuild = new Map();

function getPlaybackSettings(guildId) {
  if (!settingsByGuild.has(guildId)) {
    settingsByGuild.set(guildId, {
      volume: 0.05,
      loop: false,
      shuffle: false,
    });
  }
  return settingsByGuild.get(guildId);
}

function setVolume(guildId, volume) {
  const settings = getPlaybackSettings(guildId);
  settings.volume = volume;
  return settings;
}

function setLoop(guildId, loop) {
  const settings = getPlaybackSettings(guildId);
  settings.loop = loop;
  return settings;
}

function setShuffle(guildId, shuffle) {
  const settings = getPlaybackSettings(guildId);
  settings.shuffle = shuffle;
  return settings;
}

module.exports = {
  getPlaybackSettings,
  setVolume,
  setShuffle,
  setLoop,
};
