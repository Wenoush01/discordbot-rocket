import { SlashCommandBuilder } from "@discordjs/builders";
import {
  EmbedBuilder,
  MessageFlags,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} from "discord.js";

import buildQueueMessage from "../../../../modules/music/services/shared/QueueEmbedBuilder.js";

export default {
  category: "music",
  data: new SlashCommandBuilder()
    .setName("queue")
    .setDescription("Show the current music queue"),

  async execute(interaction, context) {
    const { container } = context;
    if (!interaction.guildId) {
      return interaction.reply({
        content: "This command can only be used in a server.",
        flags: MessageFlags.Ephemeral,
      });
    }

    const kazagumo = container.get("kazagumoService").getClient();
    const player = kazagumo.players.get(interaction.guildId);
    const queueService = container.get("queueService");

    //No Player - no queue
    if (!player) {
      return interaction.reply({
        content: "The music queue is currently empty.",
        flags: MessageFlags.Ephemeral,
      });
    }

    const current = player.queue.current ?? null;
    const queueSnapshot = queueService.getQueueSnapshot(interaction.guildId);
    const upcoming = queueSnapshot.filter((track) => track !== current);
    const tracksPerPage = 10;
    const paginatedUpcoming = queueService.getPaginatedQueue(
      interaction.guildId,
      1,
      tracksPerPage,
    );

    if (!current && upcoming.length === 0) {
      return interaction.reply({
        content: "The music queue is currently empty.",
        flags: MessageFlags.Ephemeral,
      });
    }

    const embed = buildQueueMessage(paginatedUpcoming);

    await interaction.reply({
      embeds: embed.embeds,
      components: embed.components,
      flags: MessageFlags.Ephemeral,
    });
  },
};
