//Zatím jen bootstrap index.js, který načítá token z .env a inicializuje klienta. Další funkce přidáme postupně.
require("dotenv").config();
const setupProcessHandlers = require("./bootstrap/setupProcessHandlers");
const { Client, GatewayIntentBits, Collection } = require("discord.js");
const loadCommands = require("./loaders/loadCommands");
const loadEvents = require("./loaders/loadEvents");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates,
  ],
});

client.commands = new Collection();

loadCommands(client);
loadEvents(client);

// Odhlásit se z hrdostí - gracefulShutdown
// Funkce pro zachycení signálů a odhlášení bota z Discordu při ukončení procesu. To zajistí, že bot se odhlásí správně a uvolní všechny zdroje, včetně hlasových připojení.
setupProcessHandlers(client);

client.login(process.env.DISCORD_TOKEN);
