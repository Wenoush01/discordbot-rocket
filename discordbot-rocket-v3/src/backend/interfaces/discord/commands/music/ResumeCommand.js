import { SlashCommandBuilder } from "@discordjs/builders";
import { MessageFlags } from "discord.js";

export default {
  category: "music",
  data: new SlashCommandBuilder()
    .setName("resume")
    .setDescription("Resume the currently paused track")
    .addStringOption((option) =>
      option
        .setName("input")
        .setDescription("Resumes the currently paused track")
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
      const resumed = await playbackService.resume(interaction.guildId);
      if (resumed) {
        return interaction.editReply("Resumed the currently paused track.");
      } else {
        return interaction.editReply("The player is not currently paused.");
      }
    } catch (error) {
      logger.error(`[MusicCommand] Error resuming track: ${error.message}`);
      return interaction.editReply(
        "An error occurred while resuming the track.",
      );
    }
  },
};
