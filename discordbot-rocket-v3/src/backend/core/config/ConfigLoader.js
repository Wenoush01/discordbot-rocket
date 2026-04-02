import "dotenv/config";

class ConfigLoader {
  static load() {
    return {
      discord: {
        token: requireString("DISCORD_TOKEN"),
      },
      lavalink: {
        host: optionalString("LAVALINK_HOST", "127.0.0.1"),
        port: parseNumber("LAVALINK_PORT", 2333),
        password: requireString("LAVALINK_PASSWORD"),
        secure: parseBoolean("LAVALINK_SECURE", false),
      },
      http: {
        host: optionalString("HTTP_HOST", "0.0.0.0"),
        port: parseNumber("HTTP_PORT", 3000),
      },
      cors: {
        origin: optionalString("CORS_ORIGIN", "http://localhost:5173"),
      },
      api: {
        // For simplicity, we use the same token for both Discord and API auth
        token: optionalString("API_TOKEN", ""),
      },
    };
  }
}

function requireString(name) {
  const value = process.env[name];
  if (!value || String(value).trim() === "") {
    throw new Error(`Missing required env variable: ${name}`);
  }
  return String(value).trim();
}

function optionalString(name, fallback) {
  const value = process.env[name];
  if (!value || String(value).trim() === "") return fallback;
  return String(value).trim();
}

function parseNumber(name, fallback) {
  const raw = process.env[name];
  if (!raw || String(raw).trim() === "") return fallback;
  const n = Number(raw);
  if (!Number.isFinite(n)) {
    throw new Error(
      `Invalid number for env variable: ${name}` + `(got "${raw}")`,
    );
  }
  return n;
}

function parseBoolean(name, fallback) {
  const raw = process.env[name];
  if (!raw || String(raw).trim() === "") return fallback;
  const normalized = String(raw).trim().toLowerCase();
  if (normalized === "true") return true;
  if (normalized === "false") return false;
  throw new Error(
    `Invalid boolean for env variable: ${name}` + `(got "${raw}")`,
  );
}

export default ConfigLoader;
