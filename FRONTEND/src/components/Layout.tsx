import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { SubtopicMenu } from "./SubtopicMenu";
import { TopBar } from "./TopBar";

export function Layout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  function toggleSidebar() {
    setIsSidebarOpen((current) => !current);
  }

  return (
    <div className="application">
      <Sidebar isOpen={isSidebarOpen} />

      {isSidebarOpen && <SubtopicMenu />}

      <div className="main-container">
        <TopBar onMenuToggle={toggleSidebar} />

        <main className="content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
