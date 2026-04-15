//This module's purpose: parse music:pause, music:resume, music:skip, music:stop
// call shared validation
// call PlaybackService
// trigger NowPlayingCardService refresh

class MusicInteractionService {
  constructor({
    playbackService,
    musicControlValidator,
    nowPlayingCardService,
  }) {
    this.playbackService = playbackService;
    this.musicControlValidator = musicControlValidator;
    this.nowPlayingCardService = nowPlayingCardService;
  }

  async handleButton(interaction) {
    const validation = await this.musicControlValidator.validate(interaction);
    if (!validation.ok) {
      return interaction.reply(validation.reply);
    }

    switch (interaction.customId) {
      case "music:pause":
        await this.playbackService.pause(interaction.guildId);
        break;
      case "music:resume":
        await this.playbackService.resume(interaction.guildId);
        break;
      case "music:skip":
        await this.playbackService.skip(interaction.guildId);
        break;
      case "music:skipTo":
        await this.playbackService.skipTo(interaction.guildId, 0);
        break;
      case "music:playNow":
        await this.playbackService.playNow(interaction.guildId, 0);
        break;
      case "music:removeFromQueue":
        await this.playbackService.removeFromQueue(interaction.guildId, 0);
        break;
      case "music:clear":
        await this.playbackService.clearQueue(interaction.guildId);
        break;
      case "music:stop":
        await this.playbackService.clearQueue(interaction.guildId);
        await this.playbackService.stop(interaction.guildId);
        break;
      default:
        return;
    }

    await this.nowPlayingCardService.refreshGuild(interaction.guildId);
  }
}

export default MusicInteractionService;
