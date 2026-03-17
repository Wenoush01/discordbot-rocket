// Simple event handler
import fs from "fs";
import { fileURLToPath } from "url";
import path from "path";

// is used in Container.js to register the event handler as a singleton

class EventHandler {
  constructor({ client, logger, container }) {
    this.client = client;
    this.logger = logger;
    this.container = container;
    this.events = new Map();
  }

  // method to push event objects to the events map
  addEvent(event) {
    this.events.set(event.name, event);
  }

  // method to load events from the events directory and push them to the events map
  async loadEvents() {
    const __dirname = fileURLToPath(new URL(".", import.meta.url));
    const eventFiles = fs
      .readdirSync(path.resolve(__dirname, "../../interfaces/discord/events"))
      .filter((file) => file.endsWith(".js"));
    const eventPromises = eventFiles.map(async (file) => {
      const event = await import(`../../interfaces/discord/events/${file}`);
      this.addEvent(event.default);
    });
    await Promise.all(eventPromises);
  }
  // method to iterate this.events and call client.once
  bindAll(client) {
    this.events.forEach((event) => {
      if (event.once) {
        client.once(event.name, (...args) =>
          event.execute(...args, {
            client,
            container: this.container,
            logger: this.container.get("logger"),
          }),
        );
      } else {
        client.on(event.name, (...args) =>
          event.execute(...args, {
            client,
            container: this.container,
            commandHandler: this.container.get("commandHandler"),
            logger: this.container.get("logger"),
          }),
        );
      }
    });
  }
}

export default EventHandler;
