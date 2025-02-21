"use client"

import { useEffect } from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import type { ThemeSettings } from "../../lib/theme-settings"
import { defaultThemes } from "../../lib/theme-settings"
interface ThemeProviderProps {
  children: React.ReactNode
  attribute?: string
  defaultTheme?: string
  enableSystem?: boolean
  storageKey?: string
  disableTransitionOnChange?: boolean
}

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  useEffect(() => {
    const loadThemePreferences = async () => {
      try {
        const response = await fetch("/api/settings/theme")
        const data = await response.json() as ThemeSettings
        
        // Apply color theme if available
        if (data.colorTheme) {
          const selectedTheme = defaultThemes.find((t: { id: string }) => t.id === data.colorTheme)
          if (selectedTheme) {
            const root = document.documentElement
            Object.entries(selectedTheme.colors).forEach(([key, value]) => {
              root.style.setProperty(`--${key}`, value)
            })
          }
        }
      } catch (error) {
        console.error("Failed to load theme preferences:", error)
      }
    }
    
    loadThemePreferences()
  }, [])

  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
