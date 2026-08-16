import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { SubtopicMenu } from "./SubtopicMenu";
import { TopBar } from "./TopBar";
import { MobileStudyNavigation, MobileStudyRedirect } from "./MobileStudyNavigation";
import { useStudy } from "../contexts/StudyContext";
import { estimateOfflineStorage } from "../services/offlineDb";

export function Layout() {
  const { isOffline } = useStudy();
  const [storageLabel, setStorageLabel] = useState("");
  const [isMobile, setIsMobile] = useState(() => window.matchMedia("(max-width: 800px)").matches);
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => !window.matchMedia("(max-width: 800px)").matches);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 800px)");
    const update = () => { setIsMobile(media.matches); setIsSidebarOpen(!media.matches); };
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    void estimateOfflineStorage().then((estimate) => {
      if (!estimate) return;
      const megabytes = (estimate.usage / 1024 / 1024).toLocaleString("pt-BR", { maximumFractionDigits: 1 });
      const gigabytes = (estimate.quota / 1024 / 1024 / 1024).toLocaleString("pt-BR", { maximumFractionDigits: 1 });
      setStorageLabel(`Conteúdo offline: ${megabytes} MB · quota estimada: ${gigabytes} GB`);
    }).catch(() => undefined);
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
        {isOffline && <div className="offline-content-indicator" title={storageLabel}>Offline — usando conteúdo salvo neste dispositivo.</div>}

        <main className="content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
