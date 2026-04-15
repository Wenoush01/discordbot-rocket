// This is where the Card lives
// This module's purpose: build embed + buttons, send/edit the card message, recover if the card message was deleted for whatever reason

//TODO: Add a button next to each track in the "up next" list to remove that specific track from the queue
//TODO: Add a button next to each track in the "up next" list to play that specific track immediately (using skipTo when it's implemented)
//TODO: Every update, card should check if its the last message sent in the channel, if not, it should delete itself and create a new one to stay always visible.
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
} from "discord.js";

function formatSeconds(total) {
  const mins = Math.floor(total / 60);
  const secs = total % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

function getTrackDurationSeconds(track) {
  //Kazagumo tracks have duration in ms, i want it in seconds
  const ms = Number(track?.length ?? track?.duration ?? 0);
  return Math.floor(ms / 1000);
}

class NowPlayingCardService {
  constructor({ client, kazagumoService, logger }) {
    this.client = client;
    this.kazagumo = kazagumoService.getClient();
    this.logger = logger;
    this.channelHints = new Map();
    this.cardRefs = new Map();
  }

  setChannelHint(guildId, channelId) {
    if (!guildId || !channelId) return;
    this.channelHints.set(guildId, channelId);
  }

  async refreshGuild(guildId) {
    const player = this.kazagumo.players.get(guildId);
    if (!player) return null;

    const channel = await this.getTargetChannel(player);
    if (!channel) return null;

    const payload = this.buildPayload(player);

    const ref = this.cardRefs.get(guildId);
    const messageId =
      player.data?.get?.("nowPlayingMessageId") ?? ref?.messageId;

    if (messageId) {
      const existingMessage = await channel.messages
        .fetch(messageId)
        .catch(() => null);

      if (existingMessage) {
        await existingMessage.edit(payload);

        player.data?.set?.("nowPlayingMessageId", existingMessage.id);
        player.data?.set?.("nowPlayingChannelId", channel.id);
        this.cardRefs.set(guildId, {
          channelId: channel.id,
          messageId: existingMessage.id,
        });

        return existingMessage;
      }
    }

    const sentMessage = await channel.send(payload);
    player.data?.set?.("nowPlayingMessageId", sentMessage.id);
    player.data?.set?.("nowPlayingChannelId", channel.id);
    this.cardRefs.set(guildId, {
      channelId: channel.id,
      messageId: sentMessage.id,
    });

    return sentMessage;
  }

  async clearGuild(guildId) {
    const player = this.kazagumo.players.get(guildId);

    player?.data?.delete?.("nowPlayingMessageId");
    player?.data?.delete?.("nowPlayingChannelId");

    this.cardRefs.delete(guildId);
    this.channelHints.delete(guildId);
  }

  //function to remove the card message
  async removeGuild(guildId) {
    const player = this.kazagumo.players.get(guildId);
    const ref = this.cardRefs.get(guildId);

    const channelId =
      player?.data?.get?.("nowPlayingChannelId") ??
      ref?.channelId ??
      this.channelHints.get(guildId);
    const messageId =
      player?.data?.get?.("nowPlayingMessageId") ?? ref?.messageId;

    if (!channelId || !messageId) return;

    const channel = await this.client.channels
      .fetch(channelId)
      .catch(() => null);
    if (!channel?.isTextBased?.()) return;

    const message = await channel.messages.fetch(messageId).catch(() => null);
    if (!message) return;

    try {
      await message.delete();
      return true;
    } catch (error) {
      this.logger.error(
        `[NowPlayingCardService] Failed to delete card message for guild ${guildId}: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
    return false;
  }

  async getTargetChannel(player) {
    const guildId = player.guildId;
    const channelId =
      player.data?.get?.("nowPlayingChannelId") ??
      player.textId ??
      this.channelHints.get(guildId);

    if (!channelId) return null;

    const channel = await this.client.channels
      .fetch(channelId)
      .catch(() => null);
    if (!channel?.isTextBased?.()) return null;

    return channel;
  }

  buildPayload(player) {
    return {
      embeds: [this.buildEmbed(player)],
      components: [this.buildComponents(player)],
    };
  }

  refresh(interaction) {
    const guildId = interaction.guildId;
    if (!guildId) return;

    this.refreshGuild(guildId);
  }

  buildEmbed(player) {
    const current = player.queue.current ?? null;
    const upcoming = Array.from(player.queue ?? []).slice(0, 3);
    const recentlyAdded = player.data?.get?.("recentlyAdded") ?? null;

    const upcomingText =
      upcoming.length === 0
        ? "No upcoming tracks"
        : upcoming
            .map((track, index) => {
              const duration = formatSeconds(getTrackDurationSeconds(track));
              return `**${index + 1}.** ${track.title} \`[${duration}]\``;
            })
            .join("\n");

    const currentDuration = current
      ? formatSeconds(getTrackDurationSeconds(current))
      : "0:00";

    const status = player.paused
      ? "⏸️ Paused"
      : player.playing
        ? "▶️ Playing"
        : " ⏹️ Idle";

    const embed = new EmbedBuilder()
      .setColor(0xca0000)
      .setTitle("Now Playing")
      .setDescription(
        current
          ? `**${current.title}** (${currentDuration})`
          : "No track is currently playing.",
      )
      .addFields(
        {
          name: "Status",
          value: status,
          inline: true,
        },
        {
          name: "Up next",
          value: upcomingText,
        },
      )
      .setFooter({ text: "Music controls below" });

    if (recentlyAdded) {
      const recentlyAddedText =
        recentlyAdded.type === "playlist"
          ? `Playlist: ${recentlyAdded.playlistName} (${recentlyAdded.trackCount} tracks)`
          : `Track: **${recentlyAdded.title}** (${formatSeconds(Number(recentlyAdded.duration ?? 0))})`;

      embed.addFields({
        name: "Recently Added",
        value: recentlyAddedText,
        inline: false,
      });
    }

    if (current?.thumbnail) {
      embed.setThumbnail(current.thumbnail);
    }

    if (current?.uri ?? current?.url) {
      embed.setURL(current.uri ?? current.url);
    }

    return embed;
  }

  buildComponents(player) {
    return new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(player.paused ? "music:resume" : "music:pause")
        .setLabel(player.paused ? "Resume" : "Pause")
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId("music:skip")
        .setLabel("Skip")
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId("music:clear")
        .setLabel("Clear")
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId("music:stop")
        .setLabel("Stop")
        .setStyle(ButtonStyle.Danger),
      new ButtonBuilder()
        .setCustomId("queue:show")
        .setLabel("Show Queue")
        .setStyle(ButtonStyle.Secondary),
    );
  }
}

export default NowPlayingCardService;
