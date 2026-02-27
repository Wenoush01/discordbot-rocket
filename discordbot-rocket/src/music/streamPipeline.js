const play = require("play-dl");
const { StreamType } = require("@discordjs/voice");
const { spawn } = require("node:child_process");
const ytdl = require("youtube-dl-exec");
const ffmpegPath = require("ffmpeg-static");

function isExpectedAbort(err, cleaned) {
  if (!err) return false;
  if (!cleaned) return false;
  const msg = String(err?.message ?? err);
  return (
    err?.code === "EPIPE" ||
    err?.code === "ERR_STREAM_PREMATURE_CLOSE" ||
    msg.includes("SIGKILL") ||
    msg.includes("Premature close")
  );
}

async function createStreamPipeline(url) {
  try {
    const s = await play.stream(url);
    return { stream: s.stream, inputType: s.type, cleanup: () => {} };
  } catch {
    const ytdlp = ytdl.exec(
      url,
      {
        output: "-",
        format: "bestaudio/best",
        noWarnings: true,
        noCheckCertificates: true,
      },
      { stdio: ["ignore", "pipe", "pipe"] }
    );

    const ffmpeg = spawn(
      ffmpegPath,
      [
        "-hide_banner",
        "-loglevel",
        "error",
        "-i",
        "pipe:0",
        "-f",
        "s16le",
        "-ar",
        "48000",
        "-ac",
        "2",
        "pipe:1",
      ],
      { stdio: ["pipe", "pipe", "pipe"] }
    );

    let cleaned = false;

    const onErr = (err) => {
      if (isExpectedAbort(err, cleaned)) return;
      console.error("[PIPELINE] Stream pipeline error:", err);
    };

    ytdlp.stdout.on("error", onErr);
    ffmpeg.stdin.on("error", onErr);
    ffmpeg.stdout.on("error", onErr);
    ffmpeg.on("error", onErr);
    ytdlp.on("error", onErr);

    if (typeof ytdlp.catch === "function") {
      ytdlp.catch((err) => {
        if (isExpectedAbort(err, cleaned)) return;
        console.error("[PIPELINE] yt-dlp process error:", err);
      });
    }

    ytdlp.stdout.pipe(ffmpeg.stdin);

    const cleanup = () => {
      if (cleaned) return;
      cleaned = true;

      try {
        ytdlp.stdout.unpipe(ffmpeg.stdin);
      } catch {}
      try {
        ffmpeg.stdin.destroy();
      } catch {}

      if (!ytdlp.killed) ytdlp.kill("SIGKILL");
      if (!ffmpeg.killed) ffmpeg.kill("SIGKILL");
    };

    return {
      stream: ffmpeg.stdout,
      inputType: StreamType.Raw,
      cleanup,
    };
  }
}

module.exports = { createStreamPipeline };
