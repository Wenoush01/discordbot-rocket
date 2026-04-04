import Sidebar from "./Sidebar.jsx";
import Topbar from "./Topbar.jsx";

function AppShell({ children }) {
  return (
    <div className="min-h-screen bg-transparent text-white">
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Topbar />
          <main className="flex-1 p-6 md:p-8">{children}</main>
        </div>
      </div>
    </div>
  );
}

export default AppShell;
