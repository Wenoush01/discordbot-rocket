import play from "play-dl";
import AudioProvider from "./AudioProvider.js";

class PlayDlAudioProvider extends AudioProvider {
  constructor({ logger }) {
    super();
    this.logger = logger;
  }

  async resolve(input) {
    const value = String(input || "").trim();

    if (!value) throw new Error("Input required.");

    if (this.isUrl(value)) {
      return this.resolveFromUrl(value);
    }

    return this.resolveFromSearch(value);
  }

  isUrl(value) {
    try {
      const url = new URL(value);
      return Boolean(url.protocol && url.hostname);
    } catch {
      return false;
    }
  }

  isYoutubeUrl(value) {
    try {
      const host = new URL(value).hostname.toLowerCase();
      return host.includes("youtube.com") || host.includes("youtu.be");
    } catch {
      return false;
    }
  }

  async resolveFromUrl(url) {
    if (!url || typeof url !== "string") {
      throw new Error("A valid URL string is required.");
    }

    if (!this.isYoutubeUrl(url)) {
      throw new Error("Only YouTube URLs are supported."); // Restrict to YouTube for now - will change in future
    }

    const info = await play.video_info(url);
    this.logger.info(
      `[AudioSourceResolver] Resolved video info for URL: ${url}`,
    );

    return {
      title: info.video_details.title,
      url,
      duration: Number(info.video_details.durationInSec || 0),
      thumbnail: info.video_details.thumbnails?.[0]?.url || null,
      source: "youtube",
      // Factory function to create a stream when needed, allowing for better resource management
      streamFactory: async () => {
        try {
          const result = await play.stream(url);

          this.logger.info(
            `[AudioSourceResolver] play.stream returned: ` +
              JSON.stringify({
                hasResult: Boolean(result),
                hasStream: Boolean(result?.stream),
                type: result?.type ?? null,
                resultKeys: result ? Object.keys(result) : [],
              }),
          );

          if (!result?.stream) {
            throw new Error("Failed to create audio stream for URL: " + url);
          }
          return {
            stream: result.stream,
            inputType: result.type,
          };
        } catch (error) {
          this.logger.error(`[AudioSourceResolver] play.stream failed:`, error);
          throw error;
        }
      },
    };
  }

  async resolveFromSearch(query) {
    const results = await play.search(query, {
      limit: 1,
      source: { youtube: "video" },
    });

    const first = results.find(
      (item) => (item?.url || item?.id) && item?.live !== true,
    );

    if (!first) {
      throw new Error("No results found for query: " + query);
    }

    const resolvedUrl =
      first?.url || `https://www.youtube.com/watch?v=${first.id}`;

    return this.resolveFromUrl(resolvedUrl);
  }
}

export default PlayDlAudioProvider;
