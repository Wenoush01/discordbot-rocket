function deleteMessageLater(message, delayMs = 10000) {
  if (!message || delayMs <= 0) return;

  setTimeout(async () => {
    try {
      if (!message.deleted) await message.delete();
    } catch {}
  }, delayMs);
}

module.exports = { deleteMessageLater };
