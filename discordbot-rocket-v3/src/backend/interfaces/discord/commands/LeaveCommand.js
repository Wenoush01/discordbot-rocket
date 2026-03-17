import { SlashCommandBuilder, MessageFlags } from "discord.js";

export default {
  category: "voice",
  data: new SlashCommandBuilder()
    .setName("leave")
    .setDescription("Leaves the voice channel you are in"),

  async execute(interaction, context) {
    const { container, logger } = context;
    const voiceService = container.get("voiceService");

    // Check if user is in a guild
    if (!interaction.guild) {
      return interaction.reply({
        content: "You must be in a server to use this command.",
        flags: MessageFlags.Ephemeral,
      });
    }

    // Check if user is in a voice channel
    if (!voiceService.isConnected(interaction.guildId)) {
      return interaction.reply({
        content: "I'm not connected to any voice channel in this server.",
        flags: MessageFlags.Ephemeral,
      });
    }

    const botChannelId = voiceService.getChannelId(interaction.guildId);
    if (interaction.member.voice?.channelId !== botChannelId) {
      return interaction.reply({
        content:
          "You must be in the same voice channel as me to use this command.",
        flags: MessageFlags.Ephemeral,
      });
    }

    try {
      voiceService.leave(interaction.guildId);
      await interaction.reply({
        content: "Left the voice channel!",
        flags: MessageFlags.Ephemeral,
      });
      logger.info(
        `[LeaveCommand] Bot left voice channel in guild ${interaction.guildId}`,
      );
    } catch (error) {
      logger.error("Error leaving voice channel:", error);
      await interaction.reply({
        content: "An error occurred while leaving the voice channel.",
        flags: MessageFlags.Ephemeral,
      });
    }
  },
};
