//Rekurzivní načítání všech .js souborů z adresáře commands a jeho podadresářů

const fs = require("node:fs");
const path = require("node:path");

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...walk(fullPath));
    } else if (entry.isFile() && entry.name.endsWith(".js")) {
      files.push(fullPath);
    }
  }

  return files;
}

module.exports = (client) => {
  const commandsPath = path.join(__dirname, "..", "commands");
  const commandFiles = walk(commandsPath);

  for (const file of commandFiles) {
    const command = require(file);
    if (!command?.name || typeof command.execute !== "function") continue;
    client.commands.set(command.name, command);
  }
};
