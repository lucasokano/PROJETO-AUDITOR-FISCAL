import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { SubtopicMenu } from "./SubtopicMenu";
import { TopBar } from "./TopBar";
import { MobileStudyNavigation, MobileStudyRedirect } from "./MobileStudyNavigation";

export function Layout() {
  const [isMobile, setIsMobile] = useState(() => window.matchMedia("(max-width: 800px)").matches);
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => !window.matchMedia("(max-width: 800px)").matches);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 800px)");
    const update = () => { setIsMobile(media.matches); setIsSidebarOpen(!media.matches); };
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  function toggleSidebar() {
    setIsSidebarOpen((current) => !current);
  }

  return (
    <div className="application">
      {!isMobile && <Sidebar isOpen={isSidebarOpen} />}
      {!isMobile && isSidebarOpen && <SubtopicMenu />}
      {isMobile && <MobileStudyRedirect />}
      {isMobile && isSidebarOpen && <MobileStudyNavigation onClose={() => setIsSidebarOpen(false)} />}

      <div className="main-container">
        <TopBar onMenuToggle={toggleSidebar} />

        <main className="content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
