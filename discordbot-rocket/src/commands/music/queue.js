const { getQueue } = require("../../music/queueStore");
const { formatQueueEmbed } = require("../../presenters/formatQueueEmbed");
const { replySilent } = require("../../utils/replySilent");

module.exports = {
  name: "queue",
  description: "Zobrazí aktualní frontu.",
  async execute(client, message) {
    if (!message.guild) return;

    const queue = getQueue(message.guild.id);
    const embed = formatQueueEmbed(queue, { limit: 10 });

    await replySilent(message, { embeds: [embed] });
  },
};
