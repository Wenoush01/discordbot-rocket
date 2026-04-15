// Event to create interaction for slash commands

export default {
  name: "interactionCreate",
  once: false,
  async execute(interaction, context) {
    try {
      const { container, commandHandler } = context;

      if (interaction.isButton()) {
        if (interaction.customId?.startsWith("music:")) {
          const musicInteractionService = container.get(
            "musicInteractionService",
          );
          await musicInteractionService.handleButton(interaction);
        } else if (interaction.customId?.startsWith("queue:")) {
          const queueInteractionService = container.get(
            "queueInteractionService",
          );
          await queueInteractionService.handleButton(interaction);
        }
        return;
      }

      if (interaction.isSelectMenu()) {
        if (interaction.customId?.startsWith("queue:")) {
          const queueInteractionService = container.get(
            "queueInteractionService",
          );
          await queueInteractionService.handleSelectMenu(interaction);
        }
        return;
      }

      // Check if the interaction is a command
      if (!interaction.isChatInputCommand()) return;

      // Get the command from the context
      const command = commandHandler.commands.get(interaction.commandName);

      // If the command doesn't exist, return
      if (!command) return;
      await command.execute(interaction, context);
    } catch (error) {
      context.logger.error(error);
    }
  },
};
