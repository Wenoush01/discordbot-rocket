import { SlashCommandBuilder, MessageFlags } from "discord.js";

export default {
  category: "voice",
  data: new SlashCommandBuilder()
    .setName("join")
    .setDescription("Joins the voice channel you are in"),

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

    // Check if Bot is already connected to a voice channel in this guild
    if (voiceService.isConnected(interaction.guildId)) {
      return interaction.reply({
        content: "I'm already connected to a voice channel in this server.",
        flags: MessageFlags.Ephemeral,
      });
    }

    // Check if user is in a voice channel
    const voiceChannel = interaction.member?.voice?.channel;
    if (!voiceChannel) {
      return interaction.reply({
        content: "You must be in a voice channel to use this command.",
        flags: MessageFlags.Ephemeral,
      });
    }

    await interaction.deferReply({ flags: MessageFlags.Ephemeral }); // Defer reply since joining can take a moment
    try {
      await voiceService.join(interaction.guild, voiceChannel);
      await interaction.editReply({
        content: `Joined **${voiceChannel.name}**!`,
        flags: MessageFlags.Ephemeral,
      });
      container
        .get("logger")
        .info(
          `[JoinCommand] Bot joined voice channel in guild (${interaction.guild.id})`,
        );
    } catch (error) {
      logger.error("Error joining voice channel:", error);
      await interaction.editReply({
        content: "Failed to join your voice channel.",
        flags: MessageFlags.Ephemeral,
      });
    }
  },
};
