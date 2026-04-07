class VoiceConnectionService {
  constructor({ logger, kazagumoService, voiceCueService, config }) {
    this.logger = logger;
    this.kazagumo = kazagumoService.getClient();
    this.voiceCueService = voiceCueService;
    this.sessions = new Map();
    this.defaultVolume = config.music.defaultVolume;
  }

  async joinOrMove(guild, voiceChannel, textChannelId) {
    const guildId = guild.id;
    const channelId = voiceChannel.id;

    this.sessions.set(guildId, { channelId });

    const player = this.kazagumo.players.get(guildId);

    if (!player) {
      await this.kazagumo.createPlayer({
        guildId,
        voiceId: channelId,
        textId: textChannelId,
        deaf: true,
        volume: this.defaultVolume,
      });

      await this.voiceCueService.playRandomJoinCueIfEligible(guildId);
      return "joined";
    }

    if (player.voiceId !== channelId) {
      player.setVoiceChannel(channelId);
      return "moved";
    }

    return "already";
  }

  // Called by /leave or future auto-disconnect logic. Safe to call multiple times.
  async leaveAndDestroy(guildId) {
    const player = this.kazagumo.players.get(guildId);

    if (player) {
      await this.voiceCueService.playRandomLeaveCueIfEligible(guildId);
      await player.destroy();
    }

    const hadSession = this.sessions.has(guildId);
    this.sessions.delete(guildId);

    return hadSession ? "left" : "not_connected";
  }

  // Called on shutdown - gracefully leave all voice channels.
  async leaveAll() {
    for (const guildId of [...this.sessions.keys()]) {
      await this.leaveAndDestroy(guildId);
    }
  }

  isConnected(guildId) {
    return this.sessions.has(guildId);
  }

  getChannelId(guildId) {
    return this.sessions.get(guildId)?.channelId ?? null;
  }

  getTextChannelId(guildId) {
    return this.kazagumo.players.get(guildId)?.textId ?? null;
  }
}

export default VoiceConnectionService;
