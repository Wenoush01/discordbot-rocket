//Shared validation
// This module's purpose: validate guild, player existing, same voice-channel as user
// Should return a normalized result - ok / errorMessage

import { MessageFlags } from "discord.js";

class MusicControlValidator {
  constructor({ kazagumoService }) {
    this.kazagumo = kazagumoService.getClient();
  }

  async validate(interaction) {
    if (!interaction.guildId) {
      return {
        ok: false,
        reply: {
          content: "This command can only be used in a server.",
          flags: MessageFlags.Ephemeral,
        },
      };
    }

    const player = this.kazagumo.players.get(interaction.guildId);
    if (!player) {
      return {
        ok: false,
        reply: {
          content: "There is no music player in this server.",
          flags: MessageFlags.Ephemeral,
        },
      };
    }

    const voiceChannel = interaction.member?.voice?.channel;
    if (!voiceChannel || voiceChannel.id !== player.voiceId) {
      return {
        ok: false,
        reply: {
          content:
            "You must be in the same voice channel as the bot to use this command.",
          flags: MessageFlags.Ephemeral,
        },
      };
    }

    return { ok: true, player };
  }
}
