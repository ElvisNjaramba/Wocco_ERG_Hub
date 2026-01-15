import { Outlet } from "react-router-dom";
import RadixSidebarLayout from "./RadixSideBarLayout";
import Dock from "./Dock";

export default function AppLayout() {
  const dockItems = [
    { label: "Dashboard", icon: <span>🏠</span>, onClick: () => (window.location.href = "/superuser/dashboard") },
    { label: "Hubs", icon: <span>📦</span>, onClick: () => (window.location.href = "/hubs/list") },
    { label: "Profile", icon: <span>👤</span>, onClick: () => (window.location.href = "/profile") },
  ];

  return (
    <div className="h-screen w-full">
      {/* Desktop */}
      <div className="hidden md:flex h-full">
        <RadixSidebarLayout>
          <Outlet /> {/* ✅ THIS is the missing piece */}
        </RadixSidebarLayout>
      </div>

      {/* Mobile */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50">
        <Dock items={dockItems} />
      </div>
    </div>
  );
}
