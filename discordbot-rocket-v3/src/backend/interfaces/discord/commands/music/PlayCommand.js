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

  async replyAndDelete(interaction, payload, delayMs = 2000) {
    await interaction.reply(payload);

    setTimeout(() => {
      interaction.deleteReply().catch(() => {});
    }, delayMs);
  },

  // No need for player existing validation, only if the player connected voice channel is the same as the user - it seemed logical to separate these validations - Service checks if player exists, command checks if the user using th command is in the same voice channel as the player
  async execute(interaction, context) {
    const { container, logger } = context;
    const playbackService = container.get("playbackService");
    const nowPlayingCardService = container.get("nowPlayingCardService");

    //User server validation
    if (!interaction.guildId) {
      return interaction.reply({
        content: "You must be in a server to use this command.",
        flags: MessageFlags.Ephemeral,
      });
    }

    //User voice channel validation
    const voiceChannel = interaction.member?.voice?.channel;
    if (!voiceChannel) {
      return interaction.reply({
        content: "You need to be in a voice channel to use this command.",
        flags: MessageFlags.Ephemeral,
      });
    }

    //Join or move to the user's voice channel before playing the track
    const voiceService = container.get("voiceService");
    await voiceService.joinOrMove(
      interaction.guild,
      voiceChannel,
      interaction.channelId,
    );

    try {
      const existingPlayer = playbackService.getPlayer(interaction.guildId);
      const wasAlreadyActive =
        existingPlayer?.playing || existingPlayer?.paused;
      const input = interaction.options.getString("input", true);
      const result = await playbackService.enqueueAndPlayIfIdle(
        interaction.guildId,
        input,
      );
      nowPlayingCardService.setChannelHint(
        interaction.guildId,
        interaction.channelId,
      );

      if (wasAlreadyActive) {
        await nowPlayingCardService.refresh(interaction);
      }

      if (result.kind === "playlist") {
        // Playlist result
        return this.replyAndDelete(interaction, {
          content: `Added playlist **${result.playlistName}** with ${result.trackCount} tracks to the queue.`,
          flags: MessageFlags.Ephemeral,
        });
      } else {
        // Single track result
        return this.replyAndDelete(interaction, {
          content: `Added **${result.track.title}** to the queue.`,
          flags: MessageFlags.Ephemeral,
        });
      }
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
