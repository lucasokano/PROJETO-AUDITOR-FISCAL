import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";

export function Layout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  function toggleSidebar() {
    setIsSidebarOpen((currentState) => !currentState);
  }

  return (
    <div className="application">
      <Sidebar isOpen={isSidebarOpen} />

      <div className="main-container">
        <header className="header">
          <button
            type="button"
            className="menu-button"
            onClick={toggleSidebar}
            aria-label="Abrir ou fechar menu lateral"
          >
            ☰
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