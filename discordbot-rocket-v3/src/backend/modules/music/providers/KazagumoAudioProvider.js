import AudioProvider from "./AudioProvider.js";

class KazagumoAudioProvider extends AudioProvider {
  constructor({ kazagumoService, logger }) {
    super();
    this.kazagumoService = kazagumoService;
    this.logger = logger;
  }

  async resolve(input) {
    const query = String(input || "").trim();
    if (!query) throw new Error("Input required.");

    const kazagumo = this.kazagumoService.getClient();
    const result = await kazagumo.search(query, {
      requester: { id: "system" },
    });

    if (!result?.tracks?.length) {
      throw new Error(`No results found for query: ${query}`);
    }

    const first = result.tracks[0];

    return {
      title: first.title,
      url: first.uri || first.url || null, // new observation, uri exists and now i know, wow
      duration: Math.floor((first.length || 0) / 1000), // Convert ms to seconds
      thumbnail: first.thumbnail || null,
      source: "lavalink",
      // Kazagumo needs full track object, not encoded Track
      kazagumoTrack: first,
      encodedTrack: first.encoded || first.track || null,
    };
  }
}

export default KazagumoAudioProvider;
