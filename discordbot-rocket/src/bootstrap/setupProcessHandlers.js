// Funkce pro zachycení signálů a odhlášení bota z Discordu při ukončení procesu. To zajistí, že bot se odhlásí správně a uvolní všechny zdroje, včetně hlasových připojení.
const { getVoiceConnection } = require("@discordjs/voice");

module.exports = function setupProcessHandlers(client) {
  let shuttingDown = false;

  async function gracefulShutdown(reason, error, options = { exit: true }) {
    if (shuttingDown) return;
    shuttingDown = true;

    console.log(`\x1b[31m[SHUTDOWN]\x1b[0m Důvod: ${reason}`);

    try {
      for (const guild of client.guilds.cache.values()) {
        const connection = getVoiceConnection(guild.id);
        if (connection) connection.destroy();
      }
    } catch (e) {
      console.error("\x1b[31m[SHUTDOWN]\x1b[0m Chyba při odpojování:", e);
    }

    if (error) console.error("\x1b[31m[SHUTDOWN]\x1b[0m Chyba:", error);

    await new Promise((r) => setTimeout(r, 300));
    try {
      await client.destroy();
    } catch {}

    if (options.exit) process.exit(error ? 1 : 0);
  }

  process.on("SIGINT", () => gracefulShutdown("SIGINT"));
  process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));

  process.once("SIGUSR2", async () => {
    await gracefulShutdown("SIGUSR2 (nodemon restart)", null, { exit: false });
    process.kill(process.pid, "SIGUSR2");
  });

  process.on("message", async (msg) => {
    if (msg === "shutdown") {
      await gracefulShutdown("message: shutdown", null, { exit: false });
      process.exit(0);
    }
  });

  process.on("uncaughtException", (error) => {
    if (error?.code === "EPIPE") {
      // NOVÉ
      console.warn("[WARN] Ignored uncaught EPIPE"); // NOVÉ
      return; // NOVÉ
    }

    console.error("[SHUTDOWN] Důvod: uncaughtException");
    console.error("[SHUTDOWN] Chyba:", error);
    process.exit(1);
  });
  process.on("unhandledRejection", (error) => {
    const msg = String(error?.message ?? error);

    if (error?.code === "ERR_STREAM_PREMATURE_CLOSE" || msg.includes("SIGKILL")) {
      console.warn("[WARN] Ignored expected stream shutdown rejection");
      return;
    }

    console.error("[SHUTDOWN] Důvod: unhandledRejection");
    console.error("[SHUTDOWN] Chyba:", error);
    process.exit(1);
  });
};
