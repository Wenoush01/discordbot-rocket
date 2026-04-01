// This is where the Card lives
// This module's purpose: build embed + buttons, send/edit the card message, recover if the card message was deleted for whatever reason

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
    const messageId = player.data?.get?.("nowPlayingMessageId");

    if (messageId) {
      const existingMessage = await channel.messages
        .fetch(messageId)
        .catch(() => null);

      if (existingMessage) {
        await existingMessage.edit(payload);
        return existingMessage;
      }
    }

    const sentMessage = await channel.send(payload);
    player.data?.set?.("nowPlayingMessageId", sentMessage.id);
    player.data?.set?.("nowPlayingChannelId", channel.id);

    return sentMessage;
  }

  async clearGuild(guildId) {
    const player = this.kazagumo.players.get(guildId);

    player?.data?.delete?.("nowPlayingMessageId");
    player?.data?.delete?.("nowPlayingChannelId");

    this.channelHints.delete(guildId);
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
      .setColor(0x1db954)
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
        .setCustomId("music:stop")
        .setLabel("Stop")
        .setStyle(ButtonStyle.Danger),
    );
  }
}

export default NowPlayingCardService;
