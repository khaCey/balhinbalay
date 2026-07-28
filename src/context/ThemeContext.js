import React, { createContext, useContext, useEffect } from 'react';

const STORAGE_KEY = 'balhinbalay_theme';

const ThemeContext = createContext({ theme: 'light' });

export function useTheme() {
  return useContext(ThemeContext);
}

/** Forces light theme app-wide (night / dark mode removed). */
export function ThemeProvider({ children }) {
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'light');
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (_) {}
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', '#246bff');
  }, []);

  return (
    <ThemeContext.Provider value={{ theme: 'light' }}>
      {children}
    </ThemeContext.Provider>
  );
}
