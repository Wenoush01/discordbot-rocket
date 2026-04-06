class VoiceCueService {
  constructor({ logger, kazagumoService, config, audioSourceResolver }) {
    this.logger = logger;
    this.kazagumo = kazagumoService.getClient();
    this.config = config;
    this.audioSourceResolver = audioSourceResolver;
  }

  pickRandomSource(list) {
    if (!Array.isArray(list) || list.length === 0) return null;
    const index = Math.floor(Math.random() * list.length);
    return list[index];
  }

  async playRandomJoinCueIfEligible(guildId) {
    const player = this.kazagumo.players.get(guildId);
    if (!player || player.playing) return;
    if (!this.config.voiceCues?.enabled) {
      this.logger.info(
        `[VoiceCueService] Voice cues are disabled. Skipping join cue for guild ${guildId}.`,
      );
      return;
    }
    const source = this.pickRandomSource(this.config.voiceCues.joinSources);
    if (source) {
      await this.playSource(source, guildId);
    }
  }

  async playRandomLeaveCueIfEligible(guildId) {
    const player = this.kazagumo.players.get(guildId);
    if (!player) return;

    if (!this.config.voiceCues?.enabled) {
      this.logger.info(
        `[VoiceCueService] Voice cues are disabled. Skipping leave cue for guild ${guildId}.`,
      );
      return;
    }
    const source = this.pickRandomSource(this.config.voiceCues.leaveSources);
    if (source) {
      await this.playSource(source, guildId);
    }
  }

  async playSource(source, guildId) {
    const player = this.kazagumo.players.get(guildId);
    const resolved = await this.audioSourceResolver.resolve(source);
    if (player && resolved) {
      await player.play(resolved.kazagumoTrack);
    }
  }
}

export default VoiceCueService;
