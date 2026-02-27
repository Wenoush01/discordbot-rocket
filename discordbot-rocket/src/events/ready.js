//Ready event

module.exports = {
  name: "ready",
  once: true,
  execute(client) {
    console.log(`Přihlášen jako ${client.user.tag}!`);
  },
};
