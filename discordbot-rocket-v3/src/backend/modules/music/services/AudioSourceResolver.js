// Resolver output contract:
// {
//   title: string,
//   url: string,
//   duration: number (seconds),
//   thumbnail: string (url) | null,
//   source: string (e.g. "youtube"),
//   streamFactory: async function that returns { stream: Readable, inputType: string } // - TEMPORARY
// }

class AudioSourceResolver {
  constructor({ provider, logger }) {
    this.provider = provider;
    this.logger = logger;
  }

  async resolve(input) {
    const value = String(input || "").trim();
    if (!value) throw new Error("Input required.");

    return this.provider.resolve(value);
  }
}

export default AudioSourceResolver;
