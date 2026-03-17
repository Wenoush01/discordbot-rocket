// Event to be emitted when the bot is ready and connected to Discord

export default {
  name: "ready",
  once: true,
  execute(client, context) {
    // Log a message to the console when the bot is ready
    context.logger.info(`Ready! Logged in as ${client.user.tag}`);
  },
};
