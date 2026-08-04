import { Palette } from "lucide-react";
import { accentThemes, useTheme, type AccentTheme } from "../contexts/ThemeContext";

interface TopBarProps {
  onMenuToggle: () => void;
}

export function TopBar({ onMenuToggle }: TopBarProps) {
  const { accent, setAccent } = useTheme();

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
    </header>
  );
}
