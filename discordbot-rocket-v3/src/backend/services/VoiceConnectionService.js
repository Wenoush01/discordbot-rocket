import {
  joinVoiceChannel,
  VoiceConnectionStatus,
  entersState,
} from "@discordjs/voice";

class VoiceConnectionService {
  constructor({ logger }) {
    this.logger = logger;
    // One entry per guild { connection, channelId, queue, nowPlaying, tasks }
    // queue / nowPlaying /tasks are placeholders for future music features

    this.sessions = new Map();
  }

  async join(guild, voiceChannel) {
    const connection = joinVoiceChannel({
      channelId: voiceChannel.id,
      guildId: guild.id,
      adapterCreator: voiceChannel.guild.voiceAdapterCreator,
    });

    await entersState(connection, VoiceConnectionStatus.Ready, 5_000); // wait 5 seconds for the connection to be ready

    const session = {
      connection,
      channelId: voiceChannel.id,
      queue: [], //placeholder - music module will fill this in
      nowPlaying: null, //placeholder
      tasks: new Set(), //placeholder - for stream/timer cancellation
    };

    this.sessions.set(guild.id, session);

    // Safety: if the connection is lost, cleanup the session
    connection.on("stateChange", (_, newState) => {
      if (newState.status === VoiceConnectionStatus.Disconnected) {
        this.leave(guild.id); // safe to call even if already cleaned up
      }
    });
  }

  // Called by /leave or future auto-disconnect logic. Safe to call multiple times.
  leave(guildId) {
    const session = this.sessions.get(guildId);
    if (!session) return; // already left or never joined

    // Clean up from map first
    this.sessions.delete(guildId);

    // Cleanup - will expand with music module
    session.tasks.forEach((t) => typeof t.cancel === "function" && t.cancel());
    session.queue = [];
    session.nowPlaying = null;

    // Destroy the connection if still alive

    try {
      if (session.connection.state.status !== VoiceConnectionStatus.Destroyed) {
        session.connection.destroy();
      }
    } catch (error) {
      this.logger.error(
        `Error destroying voice connection for guild ${guildId}:`,
        error,
      );
    }
  }

  // Called on shutdown - gracefully leave all voice channels.
  leaveAll() {
    for (const guildId of [...this.sessions.keys()]) {
      this.leave(guildId);
    }
  }

  isConnected(guildId) {
    return this.sessions.has(guildId);
  }

  getChannelId(guildId) {
    return this.sessions.get(guildId)?.channelId ?? null;
  }

  getConnection(guildId) {
    return this.sessions.get(guildId)?.connection ?? null;
  }
}

export default VoiceConnectionService;
