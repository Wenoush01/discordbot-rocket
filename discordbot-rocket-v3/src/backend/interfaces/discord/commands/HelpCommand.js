// Help Command for Rocket Bot - Provides a list of available commands and their descriptions
import { SlashCommandBuilder } from "@discordjs/builders";

export default {
  category: "utility",
  data: new SlashCommandBuilder()
    .setName("help")
    .setDescription(
      "Provides a list of available commands and their descriptions",
    )
    .addStringOption((option) =>
      option
        .setName("category")
        .setDescription("Command category")
        .setRequired(false),
    ),
  async execute(interaction, context) {
    const selectedCategory = interaction.options.getString("category");
    const commandMap = context.commandHandler.commands;

    const grouped = {};
    for (const command of commandMap.values()) {
      const category = command.category || "uncategorized";
      if (!grouped[category]) grouped[category] = [];
      grouped[category].push({
        name: command?.data?.name ?? "unknown",
        description: command?.data?.description ?? "No description",
      });
    }

    if (selectedCategory) {
      const key = selectedCategory.toLowerCase();
      const matchingCategory = Object.keys(grouped).find(
        (cat) => cat.toLowerCase() === key,
      );

      if (!matchingCategory) {
        await interaction.reply(
          `No commands found for category "${selectedCategory}".`,
          { ephemeral: true },
        );
        return;
      }

      const lines = grouped[matchingCategory].map(
        (cmd) => `**/${cmd.name}**: ${cmd.description}`,
      );

      await interaction.reply({
        content: `**${matchingCategory.toUpperCase()} commands:**\n\n${lines.join("\n")}`,
        ephemeral: true,
      });
      return;
    }

    const categoryLines = Object.keys(grouped)
      .sort()
      .map(
        (category) =>
          `**${category.toUpperCase()}**: ${grouped[category].length} command(s)`,
      );

    await interaction.reply({
      content: `**Available command categories:**\n\n${categoryLines.join("\n")}\n\nUse \`/help [category]\` to see commands in a specific category.`,
      ephemeral: true,
    });
  },
};
