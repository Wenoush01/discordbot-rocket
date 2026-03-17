// Logger for the bot

// is used in Container.js to register the logger as a singleton

class Logger {
  log(message) {
    console.log(`[LOG] ${message}`);
  }

  info(message, meta) {
    console.log(`[INFO] ${message} ${meta ? JSON.stringify(meta) : ""}`);
  }

  warn(message, meta) {
    console.warn(`[WARN] ${message} ${meta ? JSON.stringify(meta) : ""}`);
  }

  error(messageOrError, meta) {
    if (messageOrError instanceof Error) {
      console.error(
        `[ERROR] ${messageOrError.message} ${meta ? JSON.stringify(meta) : ""}`,
      );
      console.error(messageOrError.stack);
    } else {
      console.error(
        `[ERROR] ${messageOrError} ${meta ? JSON.stringify(meta) : ""}`,
      );
    }
  }
}

export default Logger;
