import { Boxes, LayoutDashboard, ListChecks, Network } from "lucide-react";
import { NavLink } from "react-router-dom";

const entries = [
  { to: "/admin", label: "Visão geral", icon: LayoutDashboard, end: true },
  { to: "/admin/structure", label: "Estrutura", icon: Network },
  { to: "/admin/statements", label: "Afirmações V/F", icon: ListChecks },
  { to: "/admin/knowledge", label: "Conhecimento", icon: Boxes },
];

export function AdminNavigation() {
  return (
    <nav className="admin-local-navigation" aria-label="Navegação administrativa">
      {entries.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) =>
            `admin-local-link ${isActive ? "admin-local-link-active" : ""}`
          }
        >
          <Icon size={15} aria-hidden="true" />
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
