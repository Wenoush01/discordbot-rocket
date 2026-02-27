const { EmbedBuilder } = require("discord.js");

function formatQueueEmbed(queue, options = {}) {
  const limit = options.limit || 10;
  const tracks = queue.tracks || [];
  const hasCurrent = Boolean(queue?.playing && tracks.length);

  const current = hasCurrent ? tracks[0] : null;
  const waiting = hasCurrent ? tracks.slice(1) : tracks;
  const visible = waiting.slice(0, limit);
  const remaining = Math.max(0, waiting.length - visible.length);

  const waitingText = visible.length
    ? visible.map((t, i) => `${i + 1}. ${t.title}`).join("\n")
    : "Fronta je momentálně prázdná.";

  const embed = new EmbedBuilder()
    .setColor(0x5865f2)
    .setTitle("Aktuální fronta")
    .addFields(
      {
        name: "Nyní se přehrává",
        value: current ? current.title : "Žádná skladba",
        inline: false,
      },
      { name: "Ve frontě", value: waitingText, inline: false },
    );

  if (remaining > 0) {
    embed.setFooter({ text: `...a dalších ${remaining} skladeb...` });
  }

  return embed;
}

module.exports = {
  formatQueueEmbed,
};
