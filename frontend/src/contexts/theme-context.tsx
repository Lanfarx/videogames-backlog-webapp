"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"

type Theme = "light" | "dark"
type AccentColor = "arancione" | "blu" | "verde" | "rosso" | "viola"

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
    const savedTheme = localStorage.getItem("theme") as Theme
    const savedAccentColor = localStorage.getItem("accentColor") as AccentColor

    if (savedTheme) {
      setThemeState(savedTheme)
    } else {
      // Se non ci sono preferenze salvate, imposta esplicitamente "light"
      localStorage.setItem("theme", "light")
    }

    if (savedAccentColor) {
      setAccentColorState(savedAccentColor)
    }

    setMounted(true)
  }, [])

  // Applica il tema
  useEffect(() => {
    if (!mounted) return

    const root = window.document.documentElement

    // Rimuovi tutte le classi di tema precedenti
    root.classList.remove("light", "dark")

    // Rimuovi tutte le classi di colore accent precedenti
    root.classList.remove("accent-arancione", "accent-blu", "accent-verde", "accent-rosso", "accent-viola")

    // Aggiungi la classe per il colore accent
    root.classList.add(`accent-${accentColor}`)

   
      root.classList.add(theme)
    

    // Aggiorna le variabili CSS per il colore accent basandosi sul colore selezionato
    const accentColors = {
      arancione: "251, 126, 0",
      blu: "45, 125, 246",
      verde: "16, 185, 129",
      rosso: "239, 68, 68",
      viola: "138, 92, 246"
    };

    // Applica il colore accent alle variabili CSS
    document.documentElement.style.setProperty('--accent-primary', accentColors[accentColor]);

    // Salva le preferenze
    localStorage.setItem("theme", theme)
    localStorage.setItem("accentColor", accentColor)
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
