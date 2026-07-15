import { NavLink } from "react-router-dom";

interface SidebarProps {
  isOpen: boolean;
}

const disciplines = [
  { name: "Português", path: "portugues" },
  { name: "Informática", path: "informatica" },
  { name: "Legislação", path: "legislacao" },
  { name: "Raciocínio Lógico", path: "raciocinio-logico" },
  { name: "Criminalística", path: "criminalistica" },
];

export function Sidebar({ isOpen }: SidebarProps) {
  return (
    <aside className={`sidebar ${isOpen ? "sidebar-open" : "sidebar-closed"}`}>
      <h2 className="sidebar-title">Disciplinas</h2>

      <nav className="sidebar-navigation">
        <NavLink
          to="/"
          className={({ isActive }) =>
            `sidebar-link ${isActive ? "sidebar-link-active" : ""}`
          }
        >
          Página inicial
        </NavLink>

        {disciplines.map((discipline) => (
          <NavLink
            key={discipline.path}
            to={`/disciplina/${discipline.path}`}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? "sidebar-link-active" : ""}`
            }
          >
            {discipline.name}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}