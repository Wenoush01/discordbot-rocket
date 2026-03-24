// A handler to manage graceful shutdown of the bot, ensuring all voice connections are properly closed.

async function GracefulShutdown(container) {
  const shutdown = async () => {
    container.get("logger").info("Bot is shutting down gracefully.");

    //leave all voice channels
    await container.get("playbackService").stopAll(); // Stop all playback and clear queues
    await container.get("voiceService").leaveAll();

    //destroy discord client
    const discordClient = container.get("discordClient").getClient();
    discordClient.destroy();

    container.get("logger").info("Graceful shutdown complete");
  };

  process.on("SIGINT", async () => {
    await shutdown();
    process.exit(0);
  });

  process.on("SIGTERM", async () => {
    await shutdown();
    process.exit(0);
  });
}

export default GracefulShutdown;
