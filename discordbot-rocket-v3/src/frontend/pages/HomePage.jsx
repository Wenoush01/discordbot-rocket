import { getHealth } from "../services/api";
import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";

import { Button } from "../components/ui/button";
import { Activity, Music2, Sparkles, Server, Home } from "lucide-react";

function HomePage() {
  const [health, setHealth] = useState("Loading...");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadHealth() {
      try {
        setLoading(true);
        const data = await getHealth();
        setHealth(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setLoading(false);
      }
    }

    loadHealth();
  }, []);

  const statusLabel = loading
    ? "Loading..."
    : error
      ? "Offline"
      : health.status === "ok"
        ? "Online"
        : "Unknown";

  const statusColor = loading
    ? "text-yellow-300"
    : error
      ? "text-red-400"
      : "text-[#ca0000]";

  return (
    <section className="space-y-6">
      <Card className="overflow-hidden border-[#ca0000]/20 bg-gradient-to-br from-[#ca0000]/15 via-white/5 to-transparent shadow-2xl">
        <CardContent className="grid gap-8 p-6 md:p-8 lg:grid-cols-[1.5fr_0.9fr]">
          <div>
            <div className="mb-4 inline-flex items-center rounded-full border border-[#ca0000]/30 bg-[#ca0000]/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[#ffb3b3]">
              <Sparkles className="mr-2 h-3.5 w-3.5" />
              Rocket Dashboard
            </div>
            <h1 className="text-4xl font-black tracking-tight text-white md:text-5xl">
              Control your Discord bot with ease
            </h1>

            <p className="mt-4 max-w-2xl text-base leading-7 text-gray-300 md:text-lg">
              Monitor health, manage modules, and customize your bot's behavior
              with our intuitive dashboard.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button>Open Music Module</Button>
              <Button variant="secondary">View Bot Status</Button>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardDescription>Live Backend status</CardDescription>
              <CardTitle className={statusColor}>{statusLabel}</CardTitle>
            </CardHeader>

            <CardContent className="space-y-3">
              <div className="flex items-center justify-between rounded-xl bg-white/5 px-3 py-2 text-sm">
                <span className="text-gray-400">Timestamp</span>
                <span className="max-w-[12rem] truncate text-white">
                  {health?.timestamp ?? "-"}
                </span>
              </div>

              <div className="flex items-center justify-between rounded-xl bg-white/5 px-3 py-2 text-sm">
                <span className="text-gray-400">Uptime</span>
                <span className="text-white">
                  {health?.uptimeSeconds ?? "-"} s
                </span>
              </div>

              <div className="flex items-center justify-between rounded-xl bg-white/5 px-3 py-2 text-sm">
                <span className="text-gray-400">Environment</span>
                <span className="text-white"> Local Development </span>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-[#ca0000]/15 text-[#ffb3b3]">
              <Activity className="h-5 w-5" />
            </div>
            <CardDescription>Bot Status</CardDescription>
            <CardTitle className={statusColor}>{statusLabel}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-400">
              Current connection state from the backend health check.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/15 text-violet-300">
              <Music2 className="h-5 w-5" />
            </div>
            <CardDescription>Music Module</CardDescription>
            <CardTitle>Control your music</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-400">
              Manage your music module, play songs, and customize settings.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/15 text-sky-300">
              <Server className="h-5 w-5" />
            </div>
            <CardDescription>System uptime</CardDescription>
            <CardTitle> {health?.uptimeSeconds ?? "-"} s </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-400">
              View how long the bot has been running without interruption.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <Card>
          Q
          <CardHeader>
            <CardDescription>Modules</CardDescription>
            <CardTitle>Workspace overview</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2">
            <div className="rounded-2xl border border-[#ca0000]/30 bg-[#ca0000]/10 p-4">
              <p className="text-sm font-semibold text-[#ffb3b3]">
                Music Module
              </p>
              <p className="mt-1 text-sm text-gray-200">
                Control your music module, play songs, and customize settings.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <p className="text-sm font-semibold text-white">
                Moderation Module
              </p>
              <p className="mt-1 text-sm text-gray-400">
                Placeholder for future server utilities
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription>Current focus</CardDescription>
            <CardTitle>Frontend foundation</CardTitle>
          </CardHeader>

          <CardContent>
            <ul className="space-y-3 text-sm text-gray-300">
              <li className="rounded-xl bg-black/20 px-3 py-2">
                Backend and frontend are connected
              </li>
              <li className="rounded-xl bg-black/20 px-3 py-2">
                Health status is visible on the dashboard
              </li>
              <li className="rounded-xl bg-black/20 px-3 py-2">
                Next: build the music page layout
              </li>
              <li className="rounded-xl bg-black/20 px-3 py-2">
                Then: connect the real player state and queue data etc..
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

export default HomePage;
