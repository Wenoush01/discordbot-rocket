//Příkaz join pro připojení bota do hlasového kanálu. Tento příkaz bude využívat `@discordjs/voice` pro správu hlasových připojení.
const { getOrCreateConnection } = require("./connectionManager");

module.exports = {
  name: "join",
  description: "Připojí bota do hlasového kanálu.",
  async execute(client, message) {
    const member =
      message.member ?? (await message.guild.members.fetch(message.author.id));
    const voiceChannel = member?.voice?.channel;

    try {
      getOrCreateConnection({
        guild: message.guild,
        voiceChannel,
      });
    } catch (error) {
      if (error.message === "USER_NOT_IN_VOICE_CHANNEL") {
        return;
      }
      throw error; // ostatní chyby necháme zpracovat globálně, aby se správně zalogovaly a případně spustil shutdown handler
    }
  },
};
