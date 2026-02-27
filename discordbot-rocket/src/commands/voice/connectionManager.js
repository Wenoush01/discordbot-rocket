// sdílený modul pro správu hlasových připojení. Tento modul bude obsahovat funkce pro připojení.

const { getVoiceConnection, joinVoiceChannel } = require("@discordjs/voice");

function getOrCreateConnection({ guild, voiceChannel }) {
  if (!guild) throw new Error("GUILD_REQUIRED");
  if (!voiceChannel) throw new Error("USER_NOT_IN_VOICE_CHANNEL");

  const existing = getVoiceConnection(guild.id);
  if (existing) {
    return { connection: existing, created: false };
  }

  const connection = joinVoiceChannel({
    channelId: voiceChannel.id,
    guildId: guild.id,
    adapterCreator: guild.voiceAdapterCreator,
    selfDeaf: true,
  });

  return { connection, created: true };
}

module.exports = {
  getOrCreateConnection,
};
