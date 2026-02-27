const { MessageFlags } = require("discord.js");
const { deleteMessageLater } = require("./deleteMessageLater");
const { config } = require("dotenv");

function toOptions(payload) {
  if (typeof payload === "string") return { content: payload };
  return payload ?? {};
}

async function replySilent(message, payload, config = {}) {
  const options = toOptions(payload);
  const deleteAfterMs =
    config.deleteAfterMs ?? +process.env.COMMAND_DELETE_TIMEOUT ?? 0;

  const sent = await message.reply({
    ...options,
    allowedMentions: {
      ...(options.allowedMentions ?? {}),
      repliedUser: false,
    },
    flags: [MessageFlags.SuppressNotifications],
  });

  if (deleteAfterMs > 0) {
    deleteMessageLater(sent, deleteAfterMs);
  }

  return sent;
}

module.exports = { replySilent };
