const { getQueue } = require("../../music/queueStore");
const { formatQueueEmbed } = require("../../presenters/formatQueueEmbed");

module.exports = {
  name: "queue",
  description: "Zobrazí aktualní frontu.",
  async execute(client, message) {
    if (!message.guild) return;

    const queue = getQueue(message.guild.id);
    const embed = formatQueueEmbed(queue, { limit: 10 });

    await message.reply({ embeds: [embed] });
  },
};
