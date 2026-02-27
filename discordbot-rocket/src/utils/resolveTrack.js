// Modul pro resolvování tracků z různých zdrojů (Prozatím jen z YouTube, ale později můžeme přidat další zdroje jako Spotify, SoundCloud atd.)
const ytdl = require("youtube-dl-exec");
const play = require("play-dl");

function isProbablyUrl(input) {
  return /^https?:\/\//i.test(input);
}

function pickThumbnail(thumbnails) {
  if (!Array.isArray(thumbnails) || thumbnails.length === 0) return null;
  return thumbnails[0]?.url ?? null;
}

function extractUrl(item) {
  return (
    item?.url ??
    item?.watch_url ??
    item?.webpage_url ??
    (item?.id ? `https://www.youtube.com/watch?v=${item.id}` : null)
  );
}

function normalizeTrack(item) {
  const title = item?.title ?? null;
  const url = extractUrl(item);
  const thumbnail = pickThumbnail(item?.thumbnails);

  if (!title || !url) throw new Error("RESOLVE_FAILED");
  return { title, url, thumbnail };
}

async function searchWithYtDl(query) {
  const data = await ytdl(`ytsearch5:${query}`, {
    dumpSingleJson: true,
    skipDownload: true,
    noWarnings: true,
    noCheckCertificates: true,
    defaultSearch: "ytsearch",
  });

  const first = Array.isArray(data?.entries) ? data.entries[0] : data;
  if (!first) throw new Error("NO_SEARCH_RESULTS");
  return normalizeTrack(first);
}

async function resolveTrack(input) {
  const query = input?.trim();
  if (!query) throw new Error("TRACK_QUERY_REQUIRED");

  // URL větev
  if (isProbablyUrl(query)) {
    const validity = play.yt_validate(query);
    if (validity === "invalid") throw new Error("INVALID_TRACK_URL");

    const info = await play.video_info(query);
    return normalizeTrack(info?.video_details);
  }

  // Query větev
  try {
    const results = await play.search(query, {
      limit: 5,
      source: { youtube: "video" },
    });

    const firstValid = results.find(
      (item) => !!extractUrl(item) && !!item?.title,
    );
    if (!firstValid) throw new Error("NO_SEARCH_RESULTS");

    return normalizeTrack(firstValid);
  } catch {
    return searchWithYtDl(query);
  }
}

module.exports = { resolveTrack };
