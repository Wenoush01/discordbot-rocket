import { SlashCommandBuilder } from "@discordjs/builders";

export default {
  category: "utility",
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Responds with Pong!"),
  async execute(interaction) {
    await interaction.reply("Pong!");
  },
};
