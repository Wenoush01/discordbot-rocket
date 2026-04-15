// This module's purpose: parse queue:page:index, queue:remove:index, queue:playNow:index, queue:skipTo:index
// queue paginations index starts at 1, indexes are calculated based on relative position in the queue page
import buildQueueMessage from "../shared/QueueEmbedBuilder.js";

class QueueInteractionService {
  constructor({ queueService, musicControlValidator }) {
    this.queueService = queueService;
    this.musicControlValidator = musicControlValidator;
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

    const messagePayload = buildQueueMessage(paginatedQueue);
    await interaction.editReply(messagePayload);
  }

  async handleSelectMenu(interaction) {
    const validation = await this.musicControlValidator.validate(interaction);
    if (!validation.ok) {
      return interaction.reply(validation.reply);
    }

    await interaction.deferUpdate();

    const [namespace, action, value] = interaction.customId.split(":");
    if (namespace !== "queue") return;

    switch (action) {
      case "remove":
        await this.queueService.removeFromQueue(
          interaction.guildId,
          Number(value) - 1,
        );
        break;
      case "playNow":
        await this.queueService.playNow(interaction.guildId, Number(value) - 1);
        break;
      case "skipTo":
        await this.queueService.skipTo(interaction.guildId, Number(value) - 1);
        break;
    }
  }
}

export default QueueInteractionService;
