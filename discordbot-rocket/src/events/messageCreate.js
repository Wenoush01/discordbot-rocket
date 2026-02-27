//MessageCreate event

module.exports = {
  name: "messageCreate",
  async execute(client, message) {
    if (!message) return; // Ověření, že zpráva existuje
    if (message.author?.bot) return; // Ignoruj zprávy od botů
    if (!message.guild) return; // Ignoruj zprávy mimo servery

    const prefix = "!"; // Nastavte svůj prefix
    if (!message.content.startsWith(prefix)) return; // Ignoruj zprávy bez prefixu

    const [name, ...args] = message.content
      .slice(prefix.length)
      .trim()
      .split(/\s+/);

    const command = client.commands.get(name?.toLowerCase());
    if (!command) return; // Ignoruj neznámé příkazy

    //LOG: kdo a jaký příkaz použil
    console.log(
      `\x1b[36m[COMMAND]\x1b[0m ${message.author.tag} použil příkaz: \x1b[33m${name}\x1b[0m s argumenty: \x1b[33m${args.join(" ")}\x1b[0m`,
    );

    const DELETE_DELAY_MS = 1000; // Nastavte zpoždění pro smazání zprávy (v milisekundách)

    try {
      await command.execute(client, message, args);
    } catch (error) {
      console.error("Chyba při vykonávání příkazu:", error);
      message.reply("Při vykonávání příkazu došlo k chybě.");
    } finally {
      // Smazat původní zprávu s příkazem po určitém čase
      setTimeout(async () => {
        try {
          if (!message.deleted) {
            await message.delete();
          }
        } catch (error) {
          console.warn("[MESSAGE DELETE] Nelze smazat zprávu:", error.message);
        }
      }, DELETE_DELAY_MS);
    }
  },
};
