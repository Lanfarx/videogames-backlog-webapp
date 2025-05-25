"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { loadFromLocal, saveToLocal } from '../utils/localStorage';
import { getCssVarColor } from '../utils/getCssVarColor';
import { Theme, AccentColor } from '../types/theme';

interface ThemeContextType {
  theme: Theme
  accentColor: AccentColor
  setTheme: (theme: Theme) => void
  setAccentColor: (color: AccentColor) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Imposta "light" come valore predefinito invece di "system"
  const [theme, setThemeState] = useState<Theme>("light")
  const [accentColor, setAccentColorState] = useState<AccentColor>("arancione")
  const [mounted, setMounted] = useState(false)

  // Carica le preferenze salvate
  useEffect(() => {
    const savedTheme = loadFromLocal("theme") as Theme;
    const savedAccentColor = loadFromLocal("accentColor") as AccentColor;

    if (savedTheme) {
      setThemeState(savedTheme)
    } else {
      // Se non ci sono preferenze salvate, imposta esplicitamente "light"
      saveToLocal("theme", "light")
    }

    if (savedAccentColor) {
      setAccentColorState(savedAccentColor)
    }

    setMounted(true)
  }, [])

  // Applica il tema
  useEffect(() => {
    if (!mounted) return;

    const root = window.document.documentElement;

    // Rimuovi tutte le classi di tema precedenti
    root.classList.remove('light', 'dark');

    // Rimuovi tutte le classi di colore accent precedenti
    root.classList.remove('accent-arancione', 'accent-blu', 'accent-verde', 'accent-rosso', 'accent-viola');

    // Aggiungi la classe per il colore accent
    root.classList.add(`accent-${accentColor}`)
    root.classList.add(theme)

    // Aggiorna la variabile CSS --accent-primary in base al colore selezionato
    // Usa sempre la variabile CSS di base, non valori hardcoded
    const accentVar = `--accent-${accentColor}`;
    const accentValue = getCssVarColor(accentVar, '251, 126, 0').replace('rgb(', '').replace(')', '');
    document.documentElement.style.setProperty('--accent-primary', accentValue);

    // Salva le preferenze
    saveToLocal('theme', theme);
    saveToLocal('accentColor', accentColor);
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
