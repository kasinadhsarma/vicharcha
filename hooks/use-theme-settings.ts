import { useState, useEffect } from "react"
import { useTheme } from "next-themes"
import { defaultThemes } from "@/lib/theme-settings"

export function useThemeSettings() {
  const { theme, setTheme } = useTheme()
  const [colorTheme, setColorTheme] = useState<string>("default")
  const [isLoading, setIsLoading] = useState(true)

  // Load saved theme preferences
  useEffect(() => {
    const loadThemePreferences = async () => {
      try {
        const response = await fetch("/api/settings/theme")
        const data = await response.json()
        
        if (data.theme) setTheme(data.theme)
        if (data.colorTheme) {
          setColorTheme(data.colorTheme)
          applyColorTheme(data.colorTheme)
        }
      } catch (error) {
        console.error("Failed to load theme preferences:", error)
      } finally {
        setIsLoading(false)
      }
    }
    
    loadThemePreferences()
  }, [setTheme])

  // Apply color theme to document root
  const applyColorTheme = (themeId: string) => {
    const selectedTheme = defaultThemes.find(t => t.id === themeId)
    if (selectedTheme) {
      const root = document.documentElement
      Object.entries(selectedTheme.colors).forEach(([key, value]) => {
        root.style.setProperty(`--${key}`, value)
      })
    }
  }

  // Save theme preferences
  const saveThemePreferences = async (newTheme?: string, newColorTheme?: string) => {
    try {
      await fetch("/api/settings/theme", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          theme: newTheme || theme,
          colorTheme: newColorTheme || colorTheme
        })
      })
    } catch (error) {
      console.error("Failed to save theme preferences:", error)
    }
  }

  return {
    theme,
    colorTheme,
    isLoading,
    setTheme: async (newTheme: string) => {
      setTheme(newTheme)
      await saveThemePreferences(newTheme)
    },
    setColorTheme: async (newColorTheme: string) => {
      setColorTheme(newColorTheme)
      applyColorTheme(newColorTheme)
      await saveThemePreferences(undefined, newColorTheme)
    }
  }
}
