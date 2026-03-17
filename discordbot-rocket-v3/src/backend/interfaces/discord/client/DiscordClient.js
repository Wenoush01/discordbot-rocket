import { Client, GatewayIntentBits, Partials } from "discord.js";

class DiscordClient {
  constructor() {
    this.client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildVoiceStates,
      ],
      partials: [Partials.Channel],
    });
  }

  getClient() {
    return this.client;
  }
}

export default DiscordClient;
