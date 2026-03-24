import { SlashCommandBuilder, MessageFlags } from "discord.js";

export default {
  category: "voice",
  data: new SlashCommandBuilder()
    .setName("join")
    .setDescription("Joins the voice channel you are in"),

  async execute(interaction, context) {
    const { container, logger } = context;
    const voiceService = container.get("voiceService");

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
      const result = await voiceService.joinOrMove(
        interaction.guild,
        voiceChannel,
        interaction.channelId,
      );

      let content;
      switch (result) {
        case "joined":
          content = `Joined the voice channel: ${voiceChannel.name}`;
          break;
        case "moved":
          content = `Moved to the voice channel: ${voiceChannel.name}`;
          break;
        case "already":
          content = `Already in the voice channel: ${voiceChannel.name}`;
          break;
        default:
          content = "Voice connection finished.";
      }

      await interaction.editReply({ content });
      logger.info(`[JoinCommand] ${content}`);
    } catch (error) {
      logger.error("Error joining voice channel:", error);
      await interaction.editReply({
        content: "Failed to join the voice channel.",
        flags: MessageFlags.Ephemeral,
      });
    }
  },
};
