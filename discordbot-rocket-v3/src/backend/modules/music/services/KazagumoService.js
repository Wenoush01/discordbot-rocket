import { Kazagumo } from "kazagumo";
import { Connectors } from "shoukaku";

class KazagumoService {
  constructor({ client, logger, config }) {
    this.client = client;
    this.logger = logger;
    this.config = config;
    this.kazagumo = null;
  }

  async init() {
    this.kazagumo = new Kazagumo(
      {
        defaultSearchEngine: "youtube",
        send: (guildId, payload) => {
          const guild = this.client.guilds.cache.get(guildId);
          if (guild) guild.shard.send(payload);
        },
      },
      new Connectors.DiscordJS(this.client),
      [
        {
          name: "main",
          url: `${this.config.lavalink.host}:${this.config.lavalink.port}`,
          auth: this.config.lavalink.password,
          secure: this.config.lavalink.secure,
        },
      ],
    );

    this.registerEvents();
    return this.kazagumo;
  }

  registerEvents() {
    this.kazagumo.shoukaku.on("ready", (name) => {
      this.logger.info(`[KazagumoService] Node ready: ${name}`);
    });

    this.kazagumo.shoukaku.on("error", (name, error) => {
      this.logger.error(`[KazagumoService] Node error on ${name}:`, error);
    });
  }

  getClient() {
    if (!this.kazagumo) throw new Error("Kazagumo not initialized");
    return this.kazagumo;
  }
}

export default KazagumoService;
