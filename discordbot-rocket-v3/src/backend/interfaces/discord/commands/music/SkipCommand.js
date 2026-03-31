//Command to skip the currently playing track and advance to the next one in the queue
import { SlashCommandBuilder } from "@discordjs/builders";
import { MessageFlags } from "discord.js";

export default {
  category: "music",
  data: new SlashCommandBuilder()
    .setName("skip")
    .setDescription(
      "Skip the currently playing track and play the next one in the queue",
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

    const voiceChannel = kazagumo.players.get(interaction.guildId);
    // Check if the user is in the SAME voice channel as the player
    if (
      !voiceChannel ||
      voiceChannel.id !==
        kazagumo.players.get(interaction.guildId)?.voiceChannelId
    ) {
      return interaction.reply({
        content:
          "You need to be in the same voice channel as the bot to use this command.",
        flags: MessageFlags.Ephemeral,
      });
    }

    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    try {
      const skipped = await playbackService.skip(interaction.guildId);
      if (!skipped) {
        return interaction.editReply("Nothing is currently playing to skip.");
      }

      return interaction.editReply("Skipped the current track.");
    } catch (error) {
      logger.error(error);
      return interaction.editReply(
        "An error occurred while skipping the track.",
      );
    }
  },
};
