// Shared module to import commands from the commands directory

import fs from "fs";
import { fileURLToPath } from "url";
import path from "path";

async function loadCommandsFromDirectory(baseDir, relativeDir = "") {
  const dir = relativeDir ? path.join(baseDir, relativeDir) : baseDir;

  const files = fs.readdirSync(dir).filter((file) => file.endsWith(".js"));

  return Promise.all(
    files.map(async (file) => {
      const importPath = relativeDir
        ? `../${relativeDir}/${file}`
        : `../${file}`;
      const module = await import(importPath);
      return module.default;
    }),
  );
}

async function loadRawCommandModules() {
  const __dirname = fileURLToPath(new URL(".", import.meta.url));
  const commandsDir = path.resolve(__dirname, "..");

  // Load from top-level
  const topLevel = await loadCommandsFromDirectory(commandsDir, "");

  // Load from subdirectories auto-discovering them
  const entries = fs.readdirSync(commandsDir, { withFileTypes: true });
  const subdirs = entries
    .filter((entry) => entry.isDirectory() && entry.name !== "registry")
    .map((entry) => entry.name);

  const subcommands = await Promise.all(
    subdirs.map((subdir) => loadCommandsFromDirectory(commandsDir, subdir)),
  );

  return [...topLevel, ...subcommands.flat()];
}

// For CommandHandler.js to load commands without needing to know the file structure of the commands directory
export async function loadCommandModules() {
  return loadRawCommandModules();
}

// For RegisterCommands.js to load commands in JSON format for registration with the Discord API
export async function loadCommandPayloads() {
  const modules = await loadRawCommandModules();
  return modules.map((command) => command.data.toJSON());
}
