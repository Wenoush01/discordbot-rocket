// This module's purpose: parse queue:page:index, queue:remove:index, queue:playNow:index, queue:skipTo:index
// queue paginations index starts at 1, indexes are calculated based on relative position in the queue page
import buildQueueMessage from "../shared/QueueEmbedBuilder.js";
import { MessageFlags } from "discord.js";

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

    const [namespace, action, value] = interaction.customId.split(":");
    if (namespace !== "queue") return;

    //Special case - fresh ephemeral queue on "Show Queue" button click from now playing card
    if (action === "show") {
      const paginatedQueue = this.queueService.getPaginatedQueue(
        interaction.guildId,
        1,
        10,
      );
      const messagePayload = buildQueueMessage(paginatedQueue);
      return interaction.reply({
        ...messagePayload,
        flags: MessageFlags.Ephemeral,
      });
    }

    await interaction.deferUpdate();

    const currentPage = Number(value || 1);
    let targetPage = currentPage;

    switch (action) {
      case "nextPage":
        targetPage = currentPage + 1;
        break;
      case "previousPage":
        targetPage = currentPage - 1;
        break;
      case "show":
        if (action) break;

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

    const selectedPosition = Number(interaction.values[0]);
    const currentPage = Number(value || 1);
    let targetPage = currentPage;

    switch (action) {
      case "page":
        targetPage = selectedPosition;
        break;
      case "playNow":
        await this.queueService.playNow(
          interaction.guildId,
          selectedPosition - 1,
        );
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
}

export default QueueInteractionService;
