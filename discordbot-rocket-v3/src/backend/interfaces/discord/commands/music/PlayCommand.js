import { SlashCommandBuilder } from "@discordjs/builders";
import { MessageFlags } from "discord.js";
import Track from "../../../../modules/music/domain/Track.js";

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

  async execute(interaction, context) {
    const { container, logger } = context;
    const voiceService = container.get("voiceService");
    const resolver = container.get("audioSourceResolver");
    const queueRepository = container.get("queueRepository");
    const playbackService = container.get("playbackService");

    if (!interaction.guildId) {
      return interaction.reply({
        content: "This command can only be used in a server.",
        flags: MessageFlags.Ephemeral,
      });
    }

    const memberVoiceChannelId = interaction.member?.voice?.channelId;
    if (!memberVoiceChannelId) {
      return interaction.reply({
        content: "You need to be in a voice channel to use this command.",
        flags: MessageFlags.Ephemeral,
      });
    }

    if (!voiceService.isConnected(interaction.guildId)) {
      return interaction.reply({
        content: " Use /join first so i can connect to voice",
        flags: MessageFlags.Ephemeral,
      });
    }

    if (
      voiceService.getChannelId(interaction.guildId) !== memberVoiceChannelId
    ) {
      return interaction.reply({
        content:
          "You need to be in the same voice channel as the bot to use this command.",
        flags: MessageFlags.Ephemeral,
      });
    }

    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    try {
      const input = interaction.options.getString("input", true);
      const payload = await resolver.resolve(input);
      const track = new Track(payload);

      const queue = queueRepository.getOrCreate(interaction.guildId);
      const wasIdle = !queue.getCurrent();
      const queuePos = queue.enqueue(track);

      if (wasIdle) {
        await playbackService.startIfIdle(interaction.guildId);
        return interaction.editReply({
          content: `Now playing: **${track.title}**`,
        });
      }

      return interaction.editReply({
        content: `Added to queue: **${track.title}** (${track.formattedDuration}) at position ${queuePos}.`,
      });
    } catch (error) {
      logger.error("[PlayCommand] Error processing play command:", error);
      return interaction.editReply({
        content:
          "Could not play that input. Try again with a valid YouTube URL or search query.",
      });
    }
  },
};
