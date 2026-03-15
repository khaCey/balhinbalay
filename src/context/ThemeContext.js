import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'balhinbalay_theme';

const ThemeContext = createContext(null);

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return ctx;
}

function readStoredTheme() {
  if (typeof window === 'undefined') return 'system';
  try {
    const s = localStorage.getItem(STORAGE_KEY);
    if (s === 'light' || s === 'dark' || s === 'system') return s;
  } catch (_) {}
  return 'system';
}

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(readStoredTheme);
  const [systemDark, setSystemDark] = useState(() => {
    if (typeof window === 'undefined') return false;
    const m = window.matchMedia('(prefers-color-scheme: dark)');
    return m.matches;
  });

  useEffect(() => {
    const m = typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)');
    if (!m) return;
    const handler = () => setSystemDark(m.matches);
    handler();
    m.addEventListener('change', handler);
    return () => m.removeEventListener('change', handler);
  }, []);

  const setTheme = useCallback((value) => {
    if (value !== 'system' && value !== 'light' && value !== 'dark') return;
    setThemeState(value);
    try {
      localStorage.setItem(STORAGE_KEY, value);
    } catch (_) {}
  }, []);

  const effectiveDark = theme === 'dark' || (theme === 'system' && systemDark);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', effectiveDark ? 'dark' : 'light');
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', effectiveDark ? '#1d1d1f' : '#0d7377');
  }, [effectiveDark]);

  const value = { theme, setTheme, effectiveDark };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}
