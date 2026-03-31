import { SlashCommandBuilder } from "@discordjs/builders";
import { MessageFlags } from "discord.js";

export default {
  category: "music",
  data: new SlashCommandBuilder()
    .setName("clear")
    .setDescription("Clear the current music queue"),

  async execute(interaction, context) {
    const { container, logger } = context;
    const playbackService = container.get("playbackService");
    const kazagumo = container.get("kazagumoService").getClient();

    if (!interaction.guildId) {
      return interaction.reply({
        content: "You must be in a server to use this command.",
        flags: MessageFlags.Ephemeral,
      });
    }

    const voiceChannel = interaction.member?.voice?.channel;
    // Check if the user is in the SAME voice channel as the player
    if (
      !voiceChannel ||
      voiceChannel.id !== kazagumo.players.get(interaction.guildId)?.voiceId
    ) {
      return interaction.reply({
        content:
          "You need to be in the same voice channel as the bot to use this command.",
        flags: MessageFlags.Ephemeral,
      });
    }

    try {
      const cleared = await playbackService.clearQueue(interaction.guildId);
      if (cleared) {
        return interaction.reply("Cleared the music queue.");
      } else {
        return interaction.reply("There is no queue to clear.");
      }
    } catch (error) {
      logger.error(`[MusicCommand] Error clearing queue: ${error.message}`);
      return interaction.reply("An error occurred while clearing the queue.");
    }
  },
};
