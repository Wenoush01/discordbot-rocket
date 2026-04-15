import { SlashCommandBuilder } from "@discordjs/builders";
import {
  EmbedBuilder,
  MessageFlags,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} from "discord.js";

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

export default {
  category: "music",
  data: new SlashCommandBuilder()
    .setName("queue")
    .setDescription("Show the current music queue")
    .addStringOption((option) =>
      option
        .setName("input")
        .setDescription("Shows the current music queue")
        .setRequired(false),
    ),

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

    const totalDurationSeconds =
      getTrackDurationSeconds(current) +
      upcoming.reduce((sum, track) => sum + getTrackDurationSeconds(track), 0);

    const currentDuration = current
      ? formatSeconds(getTrackDurationSeconds(current))
      : "0:00";

    const embed = new EmbedBuilder()
      .setTitle("Music Queue")
      .setDescription(
        current
          ? `${current.title} \`[${currentDuration}]\``
          : "No current track",
      )
      .setColor(0xca0000)
      // Paginated Fields for the queue, showing 10 tracks per page
      .addFields(
        {
          name: "Up next",
          value:
            paginatedUpcoming.items.length === 0
              ? "No upcoming tracks"
              : paginatedUpcoming.items
                  .map(({ track, position }) => {
                    const duration = formatSeconds(
                      getTrackDurationSeconds(track),
                    );
                    return `**${position}.** ${track.title} \`[${duration}]\``;
                  })
                  .join("\n"),
        },
        {
          name: "Total duration",
          value: formatSeconds(totalDurationSeconds),
          inline: true,
        },
      )
      .setFooter({
        text: `Page ${paginatedUpcoming.currentPage} of ${paginatedUpcoming.totalPages}`,
      })
      .setThumbnail(current?.thumbnail ?? null);

    const components = [];
    if (paginatedUpcoming.totalPages > 1) {
      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId(`queue:previousPage:${paginatedUpcoming.currentPage}`)
          .setLabel("Previous")
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId(`queue:nextPage:${paginatedUpcoming.currentPage}`)
          .setLabel("Next")
          .setStyle(ButtonStyle.Primary),
      );
      components.push(row);
    }

    await interaction.reply({
      embeds: [embed],
      components,
      flags: MessageFlags.Ephemeral,
    });

    if (current?.thumbnail) {
      embed.setThumbnail(current.thumbnail);
    }
  },
};
