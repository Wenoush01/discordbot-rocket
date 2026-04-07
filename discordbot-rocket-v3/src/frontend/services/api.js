const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const DEFAULT_GUILD_ID = import.meta.env.VITE_DEFAULT_GUILD_ID;

async function apiFetch(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`API request failed with status ${response.status}`);
  }

  return response.json();
}

export function getHealth() {
  return apiFetch("/api/health");
}

export function getMusicState(guildId = DEFAULT_GUILD_ID) {
  if (!guildId)
    throw new Error("Missing VITE_DEFAULT_GUILD_ID environment variable");
  return apiFetch(`/api/music/${guildId}/state`);
}

export function getMusicQueue(guildId = DEFAULT_GUILD_ID) {
  if (!guildId)
    throw new Error("Missing VITE_DEFAULT_GUILD_ID environment variable");
  return apiFetch(`/api/music/${guildId}/queue`);
}

export function playMusic(guildId = DEFAULT_GUILD_ID, query) {
  if (!guildId)
    throw new Error("Missing VITE_DEFAULT_GUILD_ID environment variable");
  return apiFetch(`/api/music/${guildId}/play`, {
    method: "POST",
    body: JSON.stringify({ query }),
  });
}

export function pauseMusic(guildId = DEFAULT_GUILD_ID) {
  if (!guildId)
    throw new Error("Missing VITE_DEFAULT_GUILD_ID environment variable");
  return apiFetch(`/api/music/${guildId}/pause`, { method: "POST" });
}

export function resumeMusic(guildId = DEFAULT_GUILD_ID) {
  if (!guildId)
    throw new Error("Missing VITE_DEFAULT_GUILD_ID environment variable");
  return apiFetch(`/api/music/${guildId}/resume`, { method: "POST" });
}

export function skipMusic(guildId = DEFAULT_GUILD_ID) {
  if (!guildId)
    throw new Error("Missing VITE_DEFAULT_GUILD_ID environment variable");
  return apiFetch(`/api/music/${guildId}/skip`, { method: "POST" });
}

export function clearQueue(guildId = DEFAULT_GUILD_ID) {
  if (!guildId)
    throw new Error("Missing VITE_DEFAULT_GUILD_ID environment variable");
  return apiFetch(`/api/music/${guildId}/queue/clear`, { method: "POST" });
}

export function setVolume(guildId = DEFAULT_GUILD_ID, volume) {
  if (!guildId)
    throw new Error("Missing VITE_DEFAULT_GUILD_ID environment variable");
  return apiFetch(`/api/music/${guildId}/volume`, {
    method: "POST",
    body: JSON.stringify({ volume }),
  });
}
