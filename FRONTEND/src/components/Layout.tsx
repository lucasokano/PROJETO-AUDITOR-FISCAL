import { Menu } from "lucide-react";
import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { SubtopicMenu } from "./SubtopicMenu";

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
        <header className="header">
          <button
            type="button"
            className="menu-button"
            onClick={toggleSidebar}
            aria-label="Abrir ou fechar menu"
            title="Abrir ou fechar menu"
          >
            <Menu size={22} />
          </button>

          <h1 className="header-title">Sistema de Estudos</h1>
        </header>

        <main className="content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}