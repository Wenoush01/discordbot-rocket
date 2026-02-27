//funkce příkazu pro zastavení přehrávání a vyčištění fronty

const { stopPlayback } = require("../../music/playerManager/playbackService");
const { replySilent } = require("../../utils/replySilent");

module.exports = {
  name: "stop",
  description: "Zastaví přehrávání a vyčistí frontu.",
  async execute(client, message) {
    if (!message.guild) return;
    const guildId = message.guild.id;
    const success = stopPlayback(guildId);
    if (success) {
      await replySilent(message, "Přehrávání zastaveno.");
    } else {
      await replySilent(
        message,
        "Není co zastavit, žádná hudba se nepřehrává.",
      );
    }
  },
};
