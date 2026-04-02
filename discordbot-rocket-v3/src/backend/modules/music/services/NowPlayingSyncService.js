class NowPlayingSyncService {
  constructor({ kazagumoService, nowPlayingCardService, logger }) {
    this.kazagumo = kazagumoService.getClient();
    this.nowPlayingCardService = nowPlayingCardService;
    this.logger = logger;
    this.isInitialized = false;
  }

  init() {
    if (this.isInitialized) return;
    this.isInitialized = true;

    this.kazagumo.on("playerStart", async (player, track) => {
      try {
        await this.nowPlayingCardService.refreshGuild(player.guildId);
      } catch (error) {
        this.logger.error(
          `[NowPlayingSyncService] Failed on playerStart for guild ${player.guildId}: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    });

    this.kazagumo.on("playerEnd", async (player, track, payload) => {
      try {
        await this.nowPlayingCardService.refreshGuild(player.guildId);
      } catch (error) {
        this.logger.error(
          `[NowPlayingSyncService] Failed on playerEnd for guild ${player.guildId}: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    });

    this.kazagumo.on("playerError", async (player, error) => {
      try {
        await this.nowPlayingCardService.refreshGuild(player.guildId);
      } catch (refreshError) {
        this.logger.error(
          `[NowPlayingSyncService] Failed on playerError for guild ${player.guildId}: ${refreshError instanceof Error ? refreshError.message : String(refreshError)}`,
        );
      }
    });

    this.kazagumo.on("playerDestroy", async (player) => {
      try {
        await this.nowPlayingCardService.removeGuild(player.guildId);
        await this.nowPlayingCardService.clearGuild(player.guildId);
      } catch (error) {
        this.logger.error(
          `[NowPlayingSyncService] Failed on playerDestroy for guild ${player.guildId}: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    });
  }
}

export default NowPlayingSyncService;
