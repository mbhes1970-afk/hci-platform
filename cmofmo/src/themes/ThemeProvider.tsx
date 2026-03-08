import React, { createContext, useContext, useEffect, useMemo } from 'react';
import { hciTheme, type ThemeConfig } from './hci';

// HCI is de enige tenant. VITE_BRAND env var blijft voor toekomstige white-label.
function detectBrand(): 'hci' {
  return 'hci';
}

const ThemeContext = createContext<ThemeConfig>(hciTheme);
export function useTheme() { return useContext(ThemeContext); }

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const brand = detectBrand();
  const theme = useMemo(() => hciTheme, [brand]);

  useEffect(() => {
    const root = document.documentElement;
    const c = theme.colors;
    const props: Record<string,string> = {
      '--color-primary': c.primary, '--color-primary-light': c.primaryLight,
      '--color-primary-dim': c.primaryDim, '--color-accent': c.accent,
      '--color-bg': c.bg, '--color-bg-card': c.bgCard,
      '--color-bg-elevated': c.bgElevated, '--color-border': c.border,
      '--color-text': c.text, '--color-text-dim': c.textDim,
      '--color-text-bright': c.textBright,
    };
    for (const [k, v] of Object.entries(props)) root.style.setProperty(k, v);
    document.body.style.backgroundColor = c.bg;
    document.body.style.color = c.text;
    document.title = `CMO\u2192FMO Quickscan \u00b7 ${theme.name}`;
  }, [theme]);

  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
}
