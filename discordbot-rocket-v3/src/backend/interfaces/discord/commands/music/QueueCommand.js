import { SlashCommandBuilder } from "@discordjs/builders";
import { EmbedBuilder, MessageFlags } from "discord.js";

function formatSeconds(total) {
  const mins = Math.floor(total / 60);
  const secs = total % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export default {
  category: "music",
  data: new SlashCommandBuilder()
    .setName("queue")
    .setDescription("Show the current music queue"),

  async execute(interaction, context) {
    const queueRepository = context.container.get("queueRepository");

    if (!interaction.guildId) {
      return interaction.reply({
        content: "This command can only be used in a server.",
        flags: MessageFlags.Ephemeral,
      });
    }

    const queue = queueRepository.get(interaction.guildId);
    if (!queue || queue.isEmpty()) {
      return interaction.reply({
        content: "The music queue is currently empty.",
        flags: MessageFlags.Ephemeral,
      });
    }

    const current = queue.getCurrent();
    const upcoming = queue.listUpcoming(10);
    const remaining = queue.remainingAfter(10);

    const upcomingText =
      upcoming.length === 0
        ? "No upcoming tracks"
        : upcoming
            .map(
              (track, index) =>
                `**${index + 1}. ${track.title} (${track.formattedDuration})**`,
            )
            .join("\n");

    const embed = new EmbedBuilder()
      .setTitle("Music Queue")
      .setDescription(
        current
          ? `**Now Playing:** ${current.title} (${current.formattedDuration})`
          : "Now Playing: \nNothing",
      )
      .addFields({
        name: "Up Next",
        value: upcomingText,
      })
      .setFooter({
        text: `Total duration: ${formatSeconds(queue.totalDurationSeconds())} ${
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
