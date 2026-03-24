import { SlashCommandBuilder, MessageFlags } from "discord.js";

export default {
  category: "voice",
  data: new SlashCommandBuilder()
    .setName("leave")
    .setDescription("Leaves the voice channel you are in"),

  async execute(interaction, context) {
    const { container, logger } = context;
    const voiceService = container.get("voiceService");

    if (!interaction.guild) {
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
      const result = await voiceService.leaveAndDestroy(interaction.guildId);

      let content;
      switch (result) {
        case "left":
          content = "Left the voice channel.";
          break;
        case "not_connected":
          content = "Not connected to a voice channel.";
          break;
        default:
          content = "Voice cleanup finished.";
      }
      await interaction.editReply({ content });
      logger.info(`[LeaveCommand] ${content}`);
    } catch (error) {
      logger.error("Error leaving voice channel:", error);
      await interaction.editReply({
        content: "Failed to leave the voice channel.",
        flags: MessageFlags.Ephemeral,
      });
    }
  },
};
