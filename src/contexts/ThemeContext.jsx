import { createContext, useContext, useEffect, useState } from "react";

const ThemeCtx = createContext(null);

const keys = [
  "color-primary", "color-secondary", "color-accent",
  "color-bg", "color-card", "color-text",
  "radius", "shadow", "container", "font-sans"
];

const defaults = {
  "color-primary": "#0ea5e9",
  "color-secondary": "#22c55e",
  "color-accent": "#f59e0b",
  "color-bg": "#ffffff",
  "color-card": "#ffffff",
  "color-text": "#111827",
  "radius": "14px",
  "shadow": "0 6px 14px rgba(0,0,0,.10)",
  "container": "1200px",
  "font-sans": 'ui-sans-serif, system-ui, Inter, "Segoe UI", Roboto, "Helvetica Neue", Arial',
};

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    const raw = localStorage.getItem("theme_tokens");
    return raw ? JSON.parse(raw) : defaults;
  });

  useEffect(() => {
    for (const k of keys) {
      document.documentElement.style.setProperty(`--${k}`, theme[k] ?? defaults[k]);
    }
    localStorage.setItem("theme_tokens", JSON.stringify(theme));
  }, [theme]);

  return (
    <ThemeCtx.Provider value={{ theme, setTheme, defaults }}>
      {children}
    </ThemeCtx.Provider>
  );
}

export const useTheme = () => useContext(ThemeCtx);
