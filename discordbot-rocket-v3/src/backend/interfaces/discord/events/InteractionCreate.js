// Event to create interaction for slash commands

export default {
  name: "interactionCreate",
  once: false,
  async execute(interaction, context) {
    try {
      // Check if the interaction is a command
      if (!interaction.isChatInputCommand()) return;

      // Get the command from the context
      const command = context.commandHandler.commands.get(
        interaction.commandName,
      );

      // If the command doesn't exist, return
      if (!command) return;
      await command.execute(interaction, context);
    } catch (error) {
      context.logger.error(error);
    }
  },
};
