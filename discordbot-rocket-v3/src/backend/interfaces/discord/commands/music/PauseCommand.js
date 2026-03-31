import { SlashCommandBuilder } from "@discordjs/builders";
import { MessageFlags } from "discord.js";

export default {
  category: "music",
  data: new SlashCommandBuilder()
    .setName("pause")
    .setDescription("Pause the currently playing track")
    .addBooleanOption((option) =>
      option
        .setName("boolean")
        .setDescription("Pauses the currently playing track")
        .setRequired(false),
    ),

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

    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    try {
      // paused variable is the boolean result of the pause operation
      let paused = playbackService.pause(interaction.guildId);
      if (paused) {
        return interaction.editReply("Paused the currently playing track.");
      } else {
        return interaction.editReply("The player is not currently playing.");
      }
    } catch (error) {
      logger.error(`[MusicCommand] Error pausing track: ${error.message}`);
      return interaction.editReply(
        "An error occurred while pausing the track.",
      );
    }
  },
};
