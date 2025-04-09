import { useState } from "react"
import { ColorTheme, createCustomTheme } from "@/lib/theme-settings"

export function useColorCustomization(initialTheme?: ColorTheme) {
  const [customTheme, setCustomTheme] = useState<ColorTheme | null>(initialTheme || null)

  const updateColor = (colorKey: keyof ColorTheme["colors"], value: string) => {
    if (!customTheme) return

    const updatedTheme: ColorTheme = {
      ...customTheme,
      colors: {
        ...customTheme.colors,
        [colorKey]: value
      }
    }

    // Update theme in DOM
    const root = document.documentElement
    root.style.setProperty(`--${colorKey}`, value)

    setCustomTheme(updatedTheme)
    return updatedTheme
  }

  const createTheme = (name: string, baseHue: number) => {
    const newTheme = createCustomTheme(
      `custom-${Date.now()}`,
      name,
      baseHue
    )
    setCustomTheme(newTheme)
    return newTheme
  }

  const getHSL = (color: string) => {
    const match = color.match(/hsl\((\d+)\s+(\d+)%\s+(\d+)%\)/)
    if (!match) return { h: 0, s: 0, l: 0 }
    
    return {
      h: parseInt(match[1], 10),
      s: parseInt(match[2], 10),
      l: parseInt(match[3], 10)
    }
  }

  const setHue = (hue: number) => {
    if (!customTheme) return

    const updatedColors: Record<string, string> = {}
    Object.entries(customTheme.colors).forEach(([key, value]) => {
      const { s, l } = getHSL(value)
      updatedColors[key] = `hsl(${hue} ${s}% ${l}%)`
    })

    const updatedTheme: ColorTheme = {
      ...customTheme,
      colors: updatedColors as ColorTheme["colors"]
    }

    // Update theme in DOM
    const root = document.documentElement
    Object.entries(updatedColors).forEach(([key, value]) => {
      root.style.setProperty(`--${key}`, value)
    })

    setCustomTheme(updatedTheme)
    return updatedTheme
  }

  return {
    customTheme,
    updateColor,
    createTheme,
    setHue
  }
}
