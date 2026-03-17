// Simple command handler for the bot, which will load commands
import { loadCommandModules } from "../../interfaces/discord/commands/registry/CommandRegistry.js";

// is used in Container.js to register the command handler as a singleton
class CommandHandler {
  constructor({ client, logger, container }) {
    this.commands = new Map();
    this.client = client;
    this.logger = logger;
    this.container = container;
  }

  registerCommand(command) {
    const commandName = command?.data?.name ?? command?.name;
    if (!commandName) {
      this.logger.log(
        `Command ${command} does not have a name, skipping registration`,
      );
      return;
    }
    this.commands.set(commandName, command);
  }
  async loadCommands() {
    const modules = await loadCommandModules();
    modules.forEach((command) => this.registerCommand(command));
  }
}

export default CommandHandler;
