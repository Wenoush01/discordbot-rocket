export default {
  name: "voiceStateUpdate",
  once: false,

  async execute(oldstate, newState, context) {
    const { client, container, logger } = context;

    if (newState.member?.user?.id !== client.user.id) return; // Only care about the bot's own voice state changes

    //Bot left a channel (either voluntarily or kicked/disconnected)
    if (oldstate.channelId && !newState.channelId) {
      try {
        await container.get("playbackService").stop(oldstate.guild.id); // Stop playback and clear queue for the guild
        await container.get("voiceService").leaveAndDestroy(oldstate.guild.id); // safe even if already cleaned up
        logger.info(
          `[VoiceStateUpdate] Bot removed from voice channel in guild ${oldstate.guild.id}`,
        );
      } catch (error) {
        logger.error(
          "[VoiceStateUpdate] Error handling bot leaving voice channel in guild:",
          error,
        );
      }
    }
  },
};
