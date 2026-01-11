import React, { createContext, useContext, useState, ReactNode, useCallback, useMemo, useEffect } from 'react';

export type ThemeMode = 'light' | 'dark';

export const themes = {
  light: {
    dark: false,
    background: '#F8FAFC',
    card: '#FFFFFF',
    text: '#0F172A',
    mutted: '#64748B',
    primary: '#007AFF',
    success: '#059669',
    warning: '#F59E0B',
    danger: '#DC2626',
    glassBubble: 'rgba(255,255,255,0.12)',
    border: '#E6EEF8',
    accent: '#8B5CF6'
  },
  dark: {
    dark: true,
    background: '#0b1220',
    card: '#0f1724',
    text: '#E6EEF8',
    mutted: '#94A3B8',
    primary: '#3b82f6',
    success: '#10B981',
    warning: '#F59E0B',
    danger: '#F87171',
    glassBubble: 'rgba(255,255,255,0.06)',
    border: '#1f2937',
    accent: '#6D28D9'
  }
} as const;

type ThemeContextValue = {
  mode: ThemeMode;
  theme: typeof themes.light;
  toggle: () => void;
  setMode: (m: ThemeMode) => void;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>('light');
  const toggle = useCallback(() => {
    setMode(m => {
      const next = m === 'light' ? 'dark' : 'light';
      console.log('Theme toggle:', m, '->', next);
      return next;
    });
  }, []);

  useEffect(() => {
    console.log('ThemeProvider mode:', mode);
  }, [mode]);

  const value: ThemeContextValue = useMemo(() => ({ mode, theme: themes[mode], toggle, setMode }), [mode, toggle]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}

export default ThemeContext;
