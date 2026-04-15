import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
} from "discord.js";

export default function buildQueueMessage({ items, currentPage, totalPages }) {
  function formatSeconds(total) {
    const mins = Math.floor(total / 60);
    const secs = total % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  }

  function getTrackDurationSeconds(track) {
    //Kazagumo tracks have duration in ms, i want it in seconds
    const ms = Number(track?.length ?? track?.duration ?? 0);
    return Math.floor(ms / 1000);
  }

  const embed = new EmbedBuilder()
    .setTitle("Music Queue")
    .setColor(0xca0000)
    .addFields({
      name: "Up next",
      value:
        items.length === 0
          ? "No upcoming tracks"
          : items
              .map(
                ({ track, position }) =>
                  `**${position}.** ${track.title} \`[${formatSeconds(getTrackDurationSeconds(track))}]\``,
              )
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
    new ButtonBuilder()
      .setCustomId(`queue:removeFromQueue:${currentPage}`)
      .setLabel("Remove")
      .setStyle(ButtonStyle.Danger),
    new ButtonBuilder()
      .setCustomId(`queue:playNow:${currentPage}`)
      .setLabel("Play Now")
      .setStyle(ButtonStyle.Success),
    new ButtonBuilder()
      .setCustomId(`queue:skipTo:${currentPage}`)
      .setLabel("Skip To")
      .setStyle(ButtonStyle.Secondary),
  );

  return { embeds: [embed], components: totalPages > 1 ? [row] : [] };
}
