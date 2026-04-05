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
  SkipBack,
  SkipForward,
  Volume2,
} from "lucide-react";

function QueueItem({ title, artist, active = false }) {
  return (
    <div
      className={`flex items-center justify-between rounded-2xl border px-4 py-3 ${
        active
          ? "border-[#ca0000]/30 bg-[#ca0000]/10"
          : "border-white/10 bg-black/20"
      }`}
    >
      <div>
        <p
          className={`text-sm font-semibold ${active ? "text-white" : "text-zinc-200"}`}
        >
          {title}
        </p>
        <p className="text-xs text-zinc-400"> {artist} </p>
      </div>
      {active && (
        <span className="rounded-full bg-[#ca0000]/15 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-[#ffb3b3]">
          Now Playing
        </span>
      )}
    </div>
  );
}

function MusicPage() {
  return (
    <section className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
        <Card className="overflow-hidden border-[#ca0000]/20 bg-gradient-to-br from-[#ca0000]/15 via-white/5 to-transparent shadow-2xl">
          <CardContent className="grid gap-6 p-6 md:p-8 lg:grid-cols-[220px-1fr]">
            <div>
              <span className="text-sm uppercase tracking-[0.3em]">
                Cover Art
              </span>
            </div>
            <div className="flex flex-col justify-between">
              <div>
                <div className="mb-3 inline-flex items-center rounded-full border border-[#ca0000]/30 bg-[#ca0000]/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[#ffb3b3]">
                  Now Playing
                </div>

                <h1 className="text-3xl font-black tracking-tight text-white md:text-4xl">
                  Midnight City
                </h1>

                <p className="mt-4 flex flex-wrap gap-2">
                  M83 • YouTube • 4:03
                </p>

                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="rounded-full bg-white/5 px-3 py-1 text-xs text-zinc-300">
                    Guild active
                  </span>

                  <span className="rounded-full bg-white/5 px-3 py-1 text-xs text-zinc-300">
                    Queue synced
                  </span>

                  <span className="rounded-full bg-white/5 px-3 py-1 text-xs text-zinc-300">
                    Volume 80%
                  </span>
                </div>
              </div>

              <div className="mt-6">
                <div className="h-2 overflow-hidden rounded-full bg-white/10">
                  <div className="h-full w-[42%] rounded-full bg-[#ca0000]" />
                </div>

                <div className="mt-2 flex items-center justify-between text-xs text-zinc-400">
                  <span>1:41</span>
                  <span>4:03</span>
                </div>

                <div className="mt-5 flex flex-wrap items-center gap-3">
                  <Button
                    variant="secondary"
                    className="h-11 w-11 rounded-full p-0"
                  >
                    <SkipBack className="h-4 w-4" />
                  </Button>

                  <Button className="h-12 w-12 rounded-full p-0">
                    <Play className="h-5 w-5" />
                  </Button>
                  <Button
                    variant="secondary"
                    className="h-11 w-11 rounded-full p-0"
                  >
                    <Pause className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="secondary"
                    className="h-11 w-11 rounded-full p-0"
                  >
                    <SkipForward className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" className="gap-2">
                    <Repeat className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" className="gap-2">
                    <Volume2 className="h-4 w-4" />
                    80%
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
              <span className="text-white">Playing</span>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-white/5 px-3 py-2 text-sm">
              <span className="text-zinc-400">Queue size</span>
              <span className="text-white"> 5 tracks </span>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-white/5 px-3 py-2 text-sm">
              <span className="text-zinc-400">Loop mode</span>
              <span className="text-white"> Off </span>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-white/5 px-3 py-2 text-sm">
              <span className="text-zinc-400">Source</span>
              <span className="text-white"> YouTube</span>
            </div>
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
            <QueueItem title="Midnight City" artist="M83" active />
            <QueueItem title="After Dark" artist="Mr. Kitty" />
            <QueueItem title="505" artist="Arctic Monkeys" />
            <QueueItem title="Resonance" artist="HOME" />
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
