const { getOrCreateConnection } = require("../voice/connectionManager");
const { resolveTrack } = require("../../utils/resolveTrack");
const {
  startPlaybackIfIdle,
} = require("../../music/playerManager/playbackService");
const { enqueue } = require("../../music/queueStore");
const { replySilent } = require("../../utils/replySilent");

module.exports = {
  name: "play",
  description: "Přehrává hudbu z YouTube. Použijte: !play <YouTube URL/Query>",
  async execute(client, message, args) {
    const input = args?.join(" ")?.trim();
    if (!input) {
      await replySilent(
        message,
        "Musíte zadat URL videa z YouTube nebo zadejte název videa!",
      );
      return;
    }

    try {
      const { connection } = getOrCreateConnection({
        guild: message.guild,
        voiceChannel: message.member?.voice?.channel,
      });

      const track = await resolveTrack(input);
      console.log(
        `[PLAY] Přidávám do fronty ve guildě ${message.guild.id}:`,
        track,
      );

      await replySilent(message, `Přidáno do fronty: **${track.title}**`);
      enqueue(message.guild.id, track);
      await startPlaybackIfIdle(message.guild.id, connection);
    } catch (error) {
      console.error(`[PLAY] Chyba při přehrávání: ${error.message}`, error);
      await replySilent(message, "Při přehrávání došlo k chybě.");
    }
  },
};
