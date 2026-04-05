function Sidebar() {
  return (
    <aside className="hidden w-64 border-r border-white/10 bg-black/30 p-6 backdrop-blur-md md:block">
      <div className="mb-8">
        <h1 className="text-x1 font-bold text-[#ca0000]">RocketBot</h1>
        <p className="mt-1 text-sm text-gray-400">Control Panel</p>
      </div>

      <nav className="space-y-2">
        <button className="w-full rounded-x1 bg-[#ca0000]/15 px-4 py-3 text-left text-sm font-medium text-[#ffb3b3]">
          Home
        </button>
        <button className="w-full rounded-x1 px-4 py-3 text-left text-sm text-gray-300 hover:bg-white/5">
          Music
        </button>
        <button className="w-full rounded-x1 px-4 py-3 text-left text-sm text-gray-500 hover:bg-white/5">
          More modules soon...
        </button>
      </nav>
    </aside>
  );
}

export default Sidebar;
