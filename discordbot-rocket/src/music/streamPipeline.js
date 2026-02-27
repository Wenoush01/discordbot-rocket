const play = require("play-dl");
const { StreamType } = require("@discordjs/voice");
const { spawn } = require("node:child_process");
const ytdl = require("youtube-dl-exec");
const ffmpegPath = require("ffmpeg-static");

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
      { stdio: ["ignore", "pipe", "pipe"] },
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
      { stdio: ["pipe", "pipe", "pipe"] },
    );

    ytdlp.stdout.pipe(ffmpeg.stdin);

    const cleanup = () => {
      if (!ytdlp.killed) ytdlp.kill();
      if (!ffmpeg.killed) ffmpeg.kill();
    };

    return { stream: ffmpeg.stdout, inputType: StreamType.Raw, cleanup };
  }
}

module.exports = { createStreamPipeline };
