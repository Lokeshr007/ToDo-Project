import { Outlet } from "react-router-dom";
import Sidebar from "@/shared/layout/Sidebar";
import TopBar from "@/shared/layout/TopBar";

function AppLayout() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-indigo-50/30 to-purple-50/30">
      <div className="flex">
        <Sidebar />
        <div className="flex-1">
          <TopBar />
          <main className="p-8">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}

export default AppLayout;