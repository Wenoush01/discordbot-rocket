class Bot {
  constructor({ container }) {
    this.container = container;

    // Initialize the Discord client
    const discordWrapper = container.get("discordClient"); // Access the client from the command handler
    this.client = discordWrapper.getClient();

    // ConfigLoader
    this.config = container.get("config");

    // API server
    this.apiServer = container.get("apiServer");

    // Get the command and event handlers from the container
    this.commandHandler = container.get("commandHandler");
    this.eventHandler = container.get("eventHandler");
  }

  async start() {
    // Load Events on each event
    await this.eventHandler.loadEvents();
    // Bind events to the client
    this.eventHandler.bindAll(this.client);
    // Load commands on each command
    await this.commandHandler.loadCommands();
    // Log in to Discord with the bot token
    await this.client.login(this.config.discord.token);
    // Start the API server
    await this.apiServer.start();
  }
}

export default Bot;
