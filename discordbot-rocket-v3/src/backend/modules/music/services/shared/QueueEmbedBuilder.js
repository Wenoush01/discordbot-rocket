import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  StringSelectMenuBuilder,
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

  const buttons = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`queue:previousPage:${currentPage}`)
      .setLabel("Previous Page")
      .setStyle(ButtonStyle.Primary)
      .setDisabled(currentPage <= 1),
    new ButtonBuilder()
      .setCustomId(`queue:nextPage:${currentPage}`)
      .setLabel("Next Page")
      .setStyle(ButtonStyle.Primary)
      .setDisabled(currentPage >= totalPages),
  );

  const pageMenu = new ActionRowBuilder().addComponents(
    new StringSelectMenuBuilder()
      .setCustomId(`queue:page:${currentPage}`)
      .setPlaceholder("Select page")
      .addOptions(
        Array.from({ length: totalPages }, (_, index) => ({
          label: `Page ${index + 1}`,
          value: `${index + 1}`,
        })),
      ),
  );

  const playNowMenu = new ActionRowBuilder().addComponents(
    new StringSelectMenuBuilder()
      .setCustomId(`queue:playNow:${currentPage}`)
      .setPlaceholder("Select track to play now")
      .setOptions(
        items.map(({ track, position }) => ({
          label: track.title,
          value: `${position}`,
        })),
      ),
  );

  return {
    embeds: [embed],
    components: totalPages > 1 ? [buttons, pageMenu, playNowMenu] : [],
  };
}
