import { SlashCommandBuilder } from "@discordjs/builders";
import { MessageFlags } from "discord.js";

export default {
  category: "music",
  data: new SlashCommandBuilder()
    .setName("play")
    .setDescription("Play a song from YouTube URL or search query")
    .addStringOption((option) =>
      option
        .setName("input")
        .setDescription("YouTube URL or search text")
        .setRequired(true),
    ),

  //TODO: Refactor according to new PlaybackService changes
  // No need for player existing validation, only if the player connected voice channel is the same as the user - it seemed logical to separate these validations - Service checks if player exists, command checks if the user using th command is in the same voice channel as the player
  async execute(interaction, context) {
    const { container, logger } = context;
    const playbackService = container.get("playbackService");

    if (!interaction.guildId) {
      return interaction.reply({
        content: "You must be in a server to use this command.",
        flags: MessageFlags.Ephemeral,
      });
    }

    const voiceChannel = interaction.member?.voice?.channel;
    if (!voiceChannel) {
      return interaction.reply({
        content: "You need to be in a voice channel to use this command.",
        flags: MessageFlags.Ephemeral,
      });
    }

    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    try {
      const input = interaction.options.getString("input", true);
      const result = await playbackService.enqueueAndPlayIfIdle(
        interaction.guildId,
        input,
      );

      if (result.status === "started") {
        return interaction.editReply({
          content: `Now playing: **${result.track.title}**`,
        });
      }

      return interaction.editReply({
        content: `Added to queue at position ${result.queuePos}: **${result.track.title}**`,
      });
    } catch (error) {
      // Better error handling with logging - Errors gave me {} - not very helpful
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      logger.error(
        `[PlayCommand] Error processing play command: ${errorMessage}`,
      );

      if (error instanceof Error && error.stack) {
        logger.error(error.stack);
      }
    }
  },
};
