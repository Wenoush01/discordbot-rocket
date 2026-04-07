import { useEffect, useState } from "react";
import {
  getMusicState,
  getMusicQueue,
  pauseMusic,
  resumeMusic,
  skipMusic,
  setVolume,
  clearQueue,
} from "../services/api.js";
import { Button } from "../components/ui/button.jsx";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card.jsx";
import {
  ListMusic,
  Pause,
  Play,
  Repeat,
  Search,
  SkipForward,
  Volume2,
  Trash,
} from "lucide-react";

function formatMs(ms = 0) {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = String(totalSeconds % 60).padStart(2, "0");
  return `${minutes}:${seconds}`;
}

function QueueItem({ title, artist, duration, highlight = false }) {
  return (
    <div
      className={`flex items-center justify-between rounded-2xl border px-4 py-3 ${
        highlight
          ? "border-[#ca0000]/30 bg-[#ca0000]/10"
          : "border-white/10 bg-black/20"
      }`}
    >
      <div className="min-w-0">
        <p
          className={`truncate text-sm font-semibold ${highlight ? "text-white" : "text-zinc-200"}`}
        >
          {title}
        </p>
        <p className="text-xs text-zinc-400"> {artist} </p>
      </div>
      <div className="ml-4 flex items-center gap-2">
        {duration && (
          <span className="text-xs text-zinc-400"> {duration} </span>
        )}
        {highlight && (
          <span className="rounded-full bg-[#ca0000]/15 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-[#ffb3b3]">
            Next
          </span>
        )}
      </div>
    </div>
  );
}

function MusicPage() {
  const [musicState, setMusicState] = useState(null);
  const [queueResponse, setQueueResponse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");

  async function loadMusicData() {
    try {
      setLoading(true);
      const [stateData, queueData] = await Promise.all([
        getMusicState(),
        getMusicQueue(),
      ]);
      setMusicState(stateData);
      setQueueResponse(queueData);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load music data",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMusicData();
  }, []);

  useEffect(() => {
    if (!musicState?.active) return;

    const intervalId = setInterval(async () => {
      try {
        const stateData = await getMusicState();
        setMusicState(stateData);
      } catch (err) {
        console.error("Failed to refresh music state:", err);
      }
    }, 10000); // Refresh every 10 seconds

    return () => clearInterval(intervalId);
  }, [musicState?.active]);

  async function handlePauseResume() {
    try {
      setActionLoading(playback?.paused ? "resume" : "pause");
      setError("");

      if (playback?.paused) {
        await resumeMusic();
      } else {
        await pauseMusic();
      }

      await loadMusicData();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to change playback state",
      );
    } finally {
      setActionLoading("");
    }
  }

  async function handleSkip() {
    try {
      setActionLoading("skip");
      setError("");
      await skipMusic();
      await loadMusicData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to skip track");
    } finally {
      setActionLoading("");
    }
  }

  async function handleClearQueue() {
    try {
      setActionLoading("clearQueue");
      setError("");
      await clearQueue();
      await loadMusicData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to clear queue");
    } finally {
      setActionLoading("");
    }
  }

  const nowPlaying = musicState?.nowPlaying ?? null;
  const playback = musicState?.state ?? null;
  const queue = queueResponse?.tracks ?? [];

  const isActive = Boolean(musicState?.active && nowPlaying);
  const playbackLabel = !musicState?.active
    ? "Idle"
    : playback?.paused
      ? "Paused"
      : playback?.playing
        ? "Playing"
        : "Ready";

  const progressPercent =
    nowPlaying?.durationMs && playback?.positionMs != null
      ? Math.min(
          100,
          Math.max(0, (playback.positionMs / nowPlaying.durationMs) * 100),
        )
      : 0;

  const sourceLabel = nowPlaying?.source
    ? nowPlaying.source.charAt(0).toUpperCase() + nowPlaying.source.slice(1)
    : "-";

  return (
    <section className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
        <Card className="overflow-hidden border-[#ca0000]/20 bg-gradient-to-br from-[#ca0000]/15 via-white/5 to-transparent shadow-2xl">
          <CardContent className="grid gap-6 p-6 md:p-8 lg:grid-cols-[220px-1fr]">
            <div className="flex aspect-square items-center justify-center overflow-hidden rounded-3xl border border-white/10 bg-black/30 text-zinc-500 shadow-inner">
              {nowPlaying?.thumbnail ? (
                <img
                  src={nowPlaying.thumbnail}
                  alt={nowPlaying.title ?? "Album art"}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-sm uppercase tracking-[0.3em]">
                  Cover Art
                </span>
              )}
            </div>

            <div className="flex flex-col justify-between">
              <div>
                <div className="mb-3 inline-flex items-center rounded-full border border-[#ca0000]/30 bg-[#ca0000]/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[#ffb3b3]">
                  Now Playing
                </div>

                <h1 className="text-3xl font-black tracking-tight text-white md:text-4xl">
                  {loading
                    ? "Loading..."
                    : (nowPlaying?.title ?? "Nothing is playing right now")}
                </h1>

                <p className="mt-4 flex flex-wrap gap-2">
                  {loading
                    ? "Fetching player state..."
                    : nowPlaying
                      ? `${nowPlaying.author} • ${sourceLabel} • ${nowPlaying.durationFormatted}`
                      : "Your bot is idle. Add some music to get started!"}
                </p>

                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="rounded-full bg-white/5 px-3 py-1 text-xs text-zinc-300">
                    {playbackLabel}
                  </span>

                  <span className="rounded-full bg-white/5 px-3 py-1 text-xs text-zinc-300">
                    Queue {queue.length}
                  </span>

                  <span className="rounded-full bg-white/5 px-3 py-1 text-xs text-zinc-300">
                    Volume {playback?.volume ?? "-"}%
                  </span>
                </div>
              </div>

              <div className="mt-6">
                <div className="h-2 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-[#ca0000] transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>

                <div className="mt-2 flex items-center justify-between text-xs text-zinc-400">
                  <span>{formatMs(playback?.positionMs ?? 0)}</span>
                  <span>{nowPlaying?.durationFormatted ?? "0:00"}</span>
                </div>

                <div className="mt-5 flex flex-wrap items-center gap-3">
                  <Button
                    className="h-12 w-12 rounded-full p-0"
                    onClick={handlePauseResume}
                    disabled={
                      !musicState?.active ||
                      actionLoading === "pause" ||
                      actionLoading === "resume"
                    }
                  >
                    {playback?.paused ? (
                      <Play className="h-5 w-5" />
                    ) : (
                      <Pause className="h-5 w-5" />
                    )}
                  </Button>
                  <Button
                    variant="secondary"
                    className="h-11 w-11 rounded-full p-0"
                    onClick={handleSkip}
                    disabled={!musicState?.active || actionLoading === "skip"}
                  >
                    <SkipForward className="h-4 w-4" />
                  </Button>

                  <Button variant="ghost" className="gap-2">
                    <Repeat className="h-4 w-4" />
                    {playback?.loop ?? "Loop"}
                  </Button>
                  <Button variant="ghost" className="gap-2">
                    <Volume2 className="h-4 w-4" />
                    {playback?.volume ?? "-"}%
                  </Button>
                  <Button
                    variant="secondary"
                    className="h-11 w-11 rounded-full p-0"
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-zinc-950/60">
          <CardHeader>
            <CardDescription>Session snapshot</CardDescription>
            <CardTitle>Playback status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between rounded-xl bg-white/5 px-3 py-2 text-sm">
              <span className="text-zinc-400">State</span>
              <span className="text-white">{playbackLabel}</span>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-white/5 px-3 py-2 text-sm">
              <span className="text-zinc-400">Queue size</span>
              <span className="text-white"> {queue.length} tracks </span>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-white/5 px-3 py-2 text-sm">
              <span className="text-zinc-400">Loop mode</span>
              <span className="text-white"> {playback?.loop ?? "Off"} </span>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-white/5 px-3 py-2 text-sm">
              <span className="text-zinc-400">Source</span>
              <span className="text-white"> {sourceLabel}</span>
            </div>

            {error && (
              <div className="rounded-xl border border-[#ca0000]/30 bg-[#ca0000]/10 px-3 py-2 text-sm text-[#ffb3b3]">
                {error}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
        <Card className="border-white/10 bg-zinc-950/60">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardDescription>Queue</CardDescription>
              <CardTitle className="mt-1">Up next</CardTitle>
            </div>
            <div className="rounded-full border border-white/10 bg-white/5 p-2 text-zinc-300">
              <ListMusic className="h-4 w-4" />
            </div>
          </CardHeader>

          <CardContent className="space-y-3">
            {loading ? (
              <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-zinc-400">
                Loading queue...
              </div>
            ) : queue.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-zinc-400">
                Queue is empty.
              </div>
            ) : (
              queue.map((track, index) => (
                <QueueItem
                  key={`${track.title}-${index}`}
                  title={track.title}
                  artist={track.author}
                  duration={track.durationFormatted}
                  highlight={index === 0}
                />
              ))
            )}
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-zinc-950/60">
          <CardHeader>
            <CardDescription>Add music</CardDescription>
            <CardTitle>Search or paste a link</CardTitle>
          </CardHeader>

          <CardContent>
            <div className="flex gap-3">
              <input
                type="text"
                placeholder="Search or paste a link"
                className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none placeholder:text-zinc-500 focus:border-[#ca0000]/50"
              />
              <Button className="gap-2 whitespace-nowrap">
                <Search className="h-4 w-4" />
                Add
              </Button>
            </div>

            <p className="mt-3 text-sm text-zinc-400">
              Later connection with backend
            </p>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

export default MusicPage;
