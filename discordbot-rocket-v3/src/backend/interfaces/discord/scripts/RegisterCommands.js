// script to push slash commands to Discord API for registration
import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v9";
import "dotenv/config";
import { loadCommandModules } from "../commands/registry/CommandRegistry.js";

const modules = await loadCommandModules();

// Validation of Commands
const validCommands = modules.filter((command) => {
  if (!command) {
    console.warn("[WARN] Found undefined command module");
    return false;
  }

  if (!command.data) {
    console.warn("[WARN] Command missing 'data' property:", command);
    return false;
  }
  return true;
});

console.log(
  `[INFO] Loaded ${validCommands.length} valid commands out of ${modules.length} modules.`,
);

const categories = [
  ...new Set(
    validCommands
      .map((command) => command.category)
      .filter(
        (category) => typeof category === "string" && category.trim() !== "",
      ),
  ),
];

const commands = validCommands.map((command) => {
  const json = command.data.toJSON();

  if (json.name === "help" && Array.isArray(json.options)) {
    const categoryOption = json.options.find(
      (option) => option.name === "category",
    );

    if (categoryOption && categoryOption.type === 3) {
      categoryOption.choices = categories.slice(0, 25).map((category) => ({
        name: category,
        value: category,
      }));
    }
  }

  return json;
});

// Create a new REST instance with the bot token from the environment variable
const rest = new REST({ version: "9" }).setToken(process.env.DISCORD_TOKEN);
// Deploy the commands to the Discord API
try {
  await rest.put(Routes.applicationCommands(process.env.DISCORD_CLIENT_ID), {
    body: commands,
  });
  console.log("[INFO] Successfully registered application commands.");
} catch (error) {
  console.error("[ERROR] Failed to register application commands:", error);
}

export default {};
