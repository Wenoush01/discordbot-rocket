import { SlashCommandBuilder } from "@discordjs/builders";
import { MessageFlags } from "discord.js";

export default {
  category: "music",
  data: new SlashCommandBuilder()
    .setName("volume")
    .setDescription("Set the volume of the music player")
    .addIntegerOption((option) =>
      option
        .setName("volume")
        .setDescription("The volume to set (1-100)")
        .setRequired(true),
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
      const volume = interaction.options.getInteger("volume", true);
      //Validate volume range (1 - 100)
      if (volume < 1 || volume > 100) {
        return interaction.reply({
          content: "Volume must be between 1 and 100.",
          flags: MessageFlags.Ephemeral,
        });
      }
      const setVolume = await playbackService.setVolume(
        interaction.guildId,
        volume,
      );

      if (setVolume) {
        return interaction.reply(`Volume set to ${volume}.`);
      } else {
        return interaction.reply("Failed to set volume.");
      }
    } catch (error) {
      logger.error(`[MusicCommand] Error setting volume: ${error.message}`);
    }
  },
};
