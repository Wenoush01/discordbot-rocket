//Příkaz leave pro odpojení bota od hlasového kanálu. Tento příkaz bude využívat `@discordjs/voice` pro správu hlasových připojení.

const { getVoiceConnection } = require("@discordjs/voice");

module.exports = {
  name: "leave",
  description: "Odpojí bota od hlasového kanálu.",
  async execute(client, message) {
    if (!message.guild) return; // Ověření, že příkaz je použit v rámci guildy
    const voiceConnection = getVoiceConnection(message.guild.id);
    if (!voiceConnection) {
      return;
    }
    voiceConnection.destroy();
  },
};
