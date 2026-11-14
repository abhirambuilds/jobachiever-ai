import { createContext, useContext, useEffect, useState } from 'react';

const THEME_STORAGE_KEY = 'jobachiever-theme';

const ThemeContext = createContext({
  theme: 'dark',
  setTheme: () => null,
  isDark: true,
});

export function ThemeProvider({
  children,
  defaultTheme = 'dark',
  storageKey = THEME_STORAGE_KEY,
}) {
  const [theme, setTheme] = useState(() => {
    try {
      const storedTheme = localStorage.getItem(storageKey);
      if (storedTheme) {
        return storedTheme;
      }
    } catch {
      // localStorage may fail in private browsing mode
    }
    return defaultTheme;
  });

  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');

    let resolvedDark = false;
    if (theme === 'system') {
      const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      resolvedDark = systemDark;
      root.classList.add(systemDark ? 'dark' : 'light');
    } else {
      resolvedDark = theme === 'dark';
      root.classList.add(theme);
    }

    setIsDark(resolvedDark);

    try {
      localStorage.setItem(storageKey, theme);
    } catch {
      // ignore storage errors
    }
  }, [theme, storageKey]);

  // Listen to OS system theme changes
  useEffect(() => {
    if (theme !== 'system') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => {
      const root = window.document.documentElement;
      root.classList.remove('light', 'dark');
      root.classList.add(e.matches ? 'dark' : 'light');
      setIsDark(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  const value = {
    theme,
    setTheme: (newTheme) => {
      setTheme(newTheme);
    },
    isDark,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
