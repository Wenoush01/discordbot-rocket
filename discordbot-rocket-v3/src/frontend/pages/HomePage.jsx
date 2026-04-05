import { useEffect, useState } from "react";

function HomePage() {
  const [health, setHealth] = useState("Loading...");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadHealth() {
      try {
        setLoading(true);
        const response = await fetch("http://127.0.0.1:3000/api/health");
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        const data = await response.json();
        setHealth(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setLoading(false);
      }
    }

    loadHealth();
  }, []);

  return (
    <section className="space-y-6">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur-md">
        <p className="mb-2 text-sm font-medium uppercase tracking-widest text-green-400">
          Welcome to Rocket
        </p>
        <h1 className="text-3xl font-bold text-white md:text-4xl">
          RocketBot Control Center
        </h1>

        <p className="mt-3 max-w-2xl text-gray-300">
          A central place to monitor modules, control music, and expand your bot
          with a polished web experience.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <p className="text-sm text-gray-400">Bot status</p>
          {loading && (
            <p className="mt-2 text-2xl font-semibold text-yellow-300">
              Loading...
            </p>
          )}

          {!loading && !error && (
            <p className="mt-2 text-2xl font-semibold text-green-400">
              {health.status === "ok" ? "Online" : "Unknown"}
            </p>
          )}

          {!loading && error && (
            <p className="mt-2 text-2xl font-semibold text-red-400">
              Offline ({error})
            </p>
          )}
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <p className="text-sm text-gray-400">API timestamp </p>
          <p className="mt-2 text-lg font-semibold text-white">
            {health?.timestamp ?? "-"}
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <p className="text-sm text-gray-400">Uptime</p>
          <p className="mt-2 text-2xl font-semibold text-white">
            {health?.uptimeSeconds ?? "-"} s
          </p>
        </div>
      </div>
    </section>
  );
}

export default HomePage;
