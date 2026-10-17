import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

type Theme = 'dark' | 'light';

const ThemeContext = createContext<{
  theme: Theme;
  toggle: () => void;
} | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('mb_theme_v2') as Theme | null;
    if (saved === 'dark' || saved === 'light') return saved;
    return 'dark';
  });

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('mb_theme_v2', theme);
  }, [theme]);

  const value = useMemo(
    () => ({
      theme,
      toggle: () => setTheme((t) => (t === 'dark' ? 'light' : 'dark')),
    }),
    [theme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('ThemeProvider missing');
  return ctx;
}
