import { SlashCommandBuilder } from "@discordjs/builders";
import { EmbedBuilder, MessageFlags } from "discord.js";

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

    //No Player - no queue
    if (!player) {
      return interaction.reply({
        content: "The music queue is currently empty.",
        flags: MessageFlags.Ephemeral,
      });
    }

    const current = player.queue.current ?? null;
    const allUpcoming = Array.from(player.queue ?? []);
    const upcoming = allUpcoming.slice(0, 10);
    const remaining = Math.max(0, allUpcoming.length - upcoming.length);

    if (!current && upcoming.length === 0) {
      return interaction.reply({
        content: "The music queue is currently empty.",
        flags: MessageFlags.Ephemeral,
      });
    }

    const upcomingText =
      upcoming.length === 0
        ? "No upcoming tracks"
        : upcoming
            .map((track, index) => {
              const dur = formatSeconds(getTrackDurationSeconds(track));
              return `**${index + 1}.** ${track.title} (${dur})`;
            })
            .join("\n");

    const totalDurationSeconds =
      getTrackDurationSeconds(current) +
      allUpcoming.reduce(
        (sum, track) => sum + getTrackDurationSeconds(track),
        0,
      );

    const currentDuration = current
      ? formatSeconds(getTrackDurationSeconds(current))
      : "0:00";

    const embed = new EmbedBuilder()
      .setTitle("Music Queue")
      .setDescription(
        current
          ? `**Now Playing:** ${current.title} (${currentDuration})`
          : "Now Playing: \nNothing",
      )
      .addFields({
        name: "Up Next",
        value: upcomingText,
      })
      .setFooter({
        text: `Total duration: ${formatSeconds(totalDurationSeconds)} ${
          remaining > 0 ? ` | ... and ${remaining} more` : ""
        }`,
      });

    if (current?.thumbnail) {
      embed.setThumbnail(current.thumbnail);
    }

    return interaction.reply({
      embeds: [embed],
      flags: MessageFlags.Ephemeral,
    });
  },
};
