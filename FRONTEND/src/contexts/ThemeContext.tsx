import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

const THEME_STORAGE_KEY = "study-system-accent";

export const accentThemes = {
  blue: { label: "Blue", value: "#2196f3", hover: "#42a5f5", active: "#1976d2", contrast: "#071521" },
  indigo: { label: "Indigo", value: "#3f51b5", hover: "#5c6bc0", active: "#303f9f", contrast: "#ffffff" },
  "deep-purple": { label: "Deep Purple", value: "#673ab7", hover: "#7e57c2", active: "#512da8", contrast: "#ffffff" },
  purple: { label: "Purple", value: "#9c27b0", hover: "#ab47bc", active: "#7b1fa2", contrast: "#ffffff" },
  teal: { label: "Teal", value: "#009688", hover: "#26a69a", active: "#00796b", contrast: "#ffffff" },
  green: { label: "Green", value: "#4caf50", hover: "#66bb6a", active: "#388e3c", contrast: "#07150a" },
  cyan: { label: "Cyan", value: "#00bcd4", hover: "#26c6da", active: "#0097a7", contrast: "#061517" },
  amber: { label: "Amber", value: "#ffc107", hover: "#ffca28", active: "#ffa000", contrast: "#1a1200" },
  orange: { label: "Orange", value: "#ff9800", hover: "#ffa726", active: "#f57c00", contrast: "#1a0e00" },
  "blue-gray": { label: "Blue Gray", value: "#607d8b", hover: "#78909c", active: "#455a64", contrast: "#ffffff" },
} as const;

export type AccentTheme = keyof typeof accentThemes;

interface ThemeContextValue {
  accent: AccentTheme;
  setAccent: (accent: AccentTheme) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function isAccentTheme(value: string | null): value is AccentTheme {
  return value !== null && value in accentThemes;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [accent, setAccent] = useState<AccentTheme>(() => {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    return isAccentTheme(saved) ? saved : "blue";
  });

  useEffect(() => {
    const palette = accentThemes[accent];
    const root = document.documentElement;
    root.dataset.accent = accent;
    root.style.setProperty("--color-primary", palette.value);
    root.style.setProperty("--color-primary-hover", palette.hover);
    root.style.setProperty("--color-primary-active", palette.active);
    root.style.setProperty("--color-on-primary", palette.contrast);
    localStorage.setItem(THEME_STORAGE_KEY, accent);
  }, [accent]);

  const value = useMemo(() => ({ accent, setAccent }), [accent]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme deve ser usado dentro de ThemeProvider.");
  return context;
}
