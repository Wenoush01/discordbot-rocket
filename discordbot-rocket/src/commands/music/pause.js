// funkce pro pozastavení přehrávání

const { pausePlayback } = require("../../music/playerManager/playbackService");
const { replySilent } = require("../../utils/replySilent");
module.exports = {
  name: "pause",
  description: "Pozastaví přehrávání hudby.",
  async execute(client, message) {
    if (!message.guild) return;
    const guildId = message.guild.id;
    const success = pausePlayback(guildId);
    if (success) {
      await replySilent(message, "Přehrávání pozastaveno.");
    } else {
      await replySilent(
        message,
        "Není co pozastavit, žádná hudba se nepřehrává.",
      );
    }
  },
};
