// index for Rocket v3 - refactored version of the bot with better structure and error handling.
import "dotenv/config";
import Bot from "./src/backend/core/bot/Bot.js";
import Container from "./src/backend/core/container/Container.js";
import gracefulShutdown from "./src/backend/core/handlers/GracefulShutdown.js";

// Create a new container instance to manage services
const container = new Container();

// Create a new bot instance, passing the container to it
const bot = new Bot({ container });

try {
  // Start the bot
  await bot.start();
} catch (error) {
  // Log any errors that occur during startup
  container.get("logger").error(error);
}

gracefulShutdown(container);
