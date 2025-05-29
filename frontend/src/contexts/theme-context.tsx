"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { getCssVarColor } from '../utils/getCssVarColor';
import { Theme, AccentColor } from '../types/theme';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

interface ThemeContextType {
  theme: Theme
  accentColor: AccentColor
  setTheme: (theme: Theme) => void
  setAccentColor: (color: AccentColor) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Prendi le preferenze dal profilo globale
  const userProfile = useSelector((state: RootState) => state.user.profile);
  // Imposta "light" come valore predefinito invece di "system"
  const [theme, setThemeState] = useState<Theme>(userProfile?.appPreferences?.theme || "light");
  const [accentColor, setAccentColorState] = useState<AccentColor>(userProfile?.appPreferences?.accentColor || "arancione");
  const [mounted, setMounted] = useState(false);

  // Aggiorna il tema quando cambia il profilo globale
  useEffect(() => {
    if (userProfile?.appPreferences?.theme) {
      setThemeState(userProfile.appPreferences.theme);
    }
    if (userProfile?.appPreferences?.accentColor) {
      setAccentColorState(userProfile.appPreferences.accentColor);
    }
    setMounted(true);
  }, [userProfile]);

  // Applica il tema
  useEffect(() => {
    if (!mounted) return;
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.remove('accent-arancione', 'accent-blu', 'accent-verde', 'accent-rosso', 'accent-viola');
    root.classList.add(`accent-${accentColor}`)
    root.classList.add(theme)
    const accentVar = `--accent-${accentColor}`;
    const accentValue = getCssVarColor(accentVar, '251, 126, 0').replace('rgb(', '').replace(')', '');
    document.documentElement.style.setProperty('--accent-primary', accentValue);
  }, [theme, accentColor, mounted])

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme)
  }

  const setAccentColor = (newColor: AccentColor) => {
    setAccentColorState(newColor)
  }

  const value = {
    theme,
    accentColor,
    setTheme,
    setAccentColor,
  }

  // Evita il flash di contenuto non stilizzato
  if (!mounted) {
    return null
  }

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}
