//Command to skip the currently playing track and advance to the next one in the queue
import { SlashCommandBuilder } from "@discordjs/builders";
import { MessageFlags } from "discord.js";

export default {
  category: "music",
  data: new SlashCommandBuilder()
    .setName("skip")
    .setDescription(
      "Skip the currently playing track and play the next one in the queue",
    )
    .addStringOption((option) =>
      option
        .setName("input")
        .setDescription("Skips the currently playing track")
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

    try {
      const skipped = await playbackService.skip(interaction.guildId);
      if (skipped) {
        return interaction.reply("Skipped the current track.");
      } else {
        return interaction.reply("There is no track to skip.");
      }
    } catch (error) {
      logger.error(`[MusicCommand] Error skipping track: ${error.message}`);
    }
  },
};
