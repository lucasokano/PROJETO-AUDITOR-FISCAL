import { LogOut, Palette } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { accentThemes, useTheme, type AccentTheme } from "../contexts/ThemeContext";
import { useAuth } from "../contexts/AuthContext";

interface TopBarProps {
  onMenuToggle: () => void;
}

export function TopBar({ onMenuToggle }: TopBarProps) {
  const { accent, setAccent } = useTheme();
  const { logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate("/login", { replace: true });
  }

  return (
    <header className="topbar">
      <button type="button" className="ui-icon-button topbar-menu" onClick={onMenuToggle} aria-label="Abrir ou fechar menu">
        <span aria-hidden="true">☰</span>
      </button>
      <div className="topbar-brand">
        <span className="topbar-brand-mark" aria-hidden="true">E</span>
        <strong>Sistema de Estudos</strong>
      </div>
      <div className="topbar-spacer" />
      <label className="theme-picker">
        <Palette size={16} aria-hidden="true" />
        <span>Tema</span>
        <select value={accent} onChange={(event) => setAccent(event.target.value as AccentTheme)} aria-label="Cor principal da interface">
          {Object.entries(accentThemes).map(([key, theme]) => (
            <option key={key} value={key}>{theme.label}</option>
          ))}
        </select>
      </label>
      <button type="button" className="topbar-logout" onClick={() => void handleLogout()}><LogOut size={15} /><span>Sair</span></button>
    </header>
  );
}
