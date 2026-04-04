function Topbar() {
  return (
    <header className="border-b border-white/10 bg-black/20 px-6 py-4 backdrop-blur-md md:px-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">Dashboard</h2>
          <p className="text-sm text-gray-400">Manage your discord bot</p>
        </div>

        <div className="rounded-full border border-green-400/30 bg-green-500/10 px-3 py-1 text-xs font-medium text-green-300">
          Online
        </div>
      </div>
    </header>
  );
}

export default Topbar;
