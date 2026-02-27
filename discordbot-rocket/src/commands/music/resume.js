// funkce příkazu pro obnovení přehrávání

const { resumePlayback } = require("../../music/playerManager/playbackService");
const { replySilent } = require("../../utils/replySilent");

module.exports = {
  name: "resume",
  description: "Obnoví přehrávání hudby.",
  async execute(client, message) {
    if (!message.guild) return;
    const guildId = message.guild.id;
    const success = resumePlayback(guildId);

    if (success) {
      await replySilent(message, "Přehrávání obnoveno.");
    } else {
      await replySilent(message, "Není co obnovit, žádná hudba se nepřehrává.");
    }
  },
};
