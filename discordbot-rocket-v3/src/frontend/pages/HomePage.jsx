function HomePage() {
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
          <p className="mt-2 text-2xl font-semibold text-green-400">Online</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <p className="text-sm text-gray-400">Guilds</p>
          <p className="mt-2 text-2xl font-semibold text-white">
            Music page UI
          </p>
        </div>
      </div>
    </section>
  );
}

export default HomePage;
