// This module's purpose: parse queue:page:index, queue:remove:index, queue:playNow:index, queue:skipTo:index
// queue paginations index starts at 1, indexes are calculated based on relative position in the queue page
import {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} from "discord.js";

class QueueInteractionService {
  constructor({ queueService, musicControlValidator }) {
    this.queueService = queueService;
    this.musicControlValidator = musicControlValidator;
  }

  buildQueueMessage({ items, currentPage, totalPages }) {
    const embed = new EmbedBuilder()
      .setTitle("Music Queue")
      .setColor(0xca0000)
      .addFields({
        name: "Up next",
        value:
          items.length === 0
            ? "No upcoming tracks"
            : items
                .map(({ track, position }) => `**${position}.** ${track.title}`)
                .join("\n"),
      })
      .setFooter({ text: `Page ${currentPage} of ${totalPages}` });

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(`queue:previousPage:${currentPage}`)
        .setLabel("Previous")
        .setStyle(ButtonStyle.Primary)
        .setDisabled(currentPage <= 1),
      new ButtonBuilder()
        .setCustomId(`queue:nextPage:${currentPage}`)
        .setLabel("Next")
        .setStyle(ButtonStyle.Primary)
        .setDisabled(currentPage >= totalPages),
    );

    return { embeds: [embed], components: totalPages > 1 ? [row] : [] };
  }

  async handleButton(interaction) {
    const validation = await this.musicControlValidator.validate(interaction);
    if (!validation.ok) {
      return interaction.reply(validation.reply);
    }

    await interaction.deferUpdate();

    const [namespace, action, value] = interaction.customId.split(":");
    if (namespace !== "queue") return;
    const currentPage = Number(value || 1);
    let targetPage = currentPage;

    switch (action) {
      case "remove":
        await this.queueService.removeFromQueue(
          interaction.guildId,
          (currentPage - 1) * 10 + index - 1,
        );
        break;
      case "playNow":
        await this.queueService.playNow(
          interaction.guildId,
          (currentPage - 1) * 10 + index - 1,
        );
        break;
      case "skipTo":
        await this.queueService.skipTo(
          interaction.guildId,
          (currentPage - 1) * 10 + index - 1,
        );
        break;
      case "nextPage":
        targetPage = currentPage + 1;
        break;
      case "previousPage":
        targetPage = currentPage - 1;
        break;

      default:
        return;
    }
    const paginatedQueue = this.queueService.getPaginatedQueue(
      interaction.guildId,
      targetPage,
      10,
    );

    const messagePayload = this.buildQueueMessage(paginatedQueue);
    await interaction.editReply(messagePayload);
  }
}

export default QueueInteractionService;
