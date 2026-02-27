// funkce příkazu pro přeskočení aktuální skladby a přechod na další v pořadí

const { skipPlayback } = require("../../music/playerManager/playbackService");
const { replySilent } = require("../../utils/replySilent");

module.exports = {
  name: "skip",
  description: "Přeskočí aktuální skladbu a přehraje další v pořadí.",
  async execute(client, message) {
    if (!message.guild) return;
    const guildId = message.guild.id;
    const success = skipPlayback(guildId);

    if (success) {
      await replySilent(message, "Přeskoceno.");
    } else {
      await replySilent(message, "Neexistuje další skladba.");
    }
  },
};
