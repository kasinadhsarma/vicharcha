import { useCallback, useEffect, useState } from 'react'

export interface Settings {
  darkMode: boolean
  notifications: boolean
  autoplay: boolean
  quality: 'auto' | 'low' | 'medium' | 'high'
  language: string
  isAdultContentEnabled: boolean
}

const defaultSettings: Settings = {
  darkMode: false,
  notifications: true,
  autoplay: true,
  quality: 'auto',
  language: 'en',
  isAdultContentEnabled: false
}

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(defaultSettings)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadSettings = () => {
      try {
        const savedSettings = localStorage.getItem('app-settings')
        if (savedSettings) {
          setSettings(JSON.parse(savedSettings))
        }
      } catch (error) {
        console.error('Failed to load settings:', error)
      } finally {
        setLoading(false)
      }
    }

    loadSettings()
  }, [])

  const updateSettings = useCallback((newSettings: Partial<Settings>) => {
    setSettings(current => {
      const updated = { ...current, ...newSettings }
      try {
        localStorage.setItem('app-settings', JSON.stringify(updated))
      } catch (error) {
        console.error('Failed to save settings:', error)
      }
      return updated
    })
  }, [])

  const resetSettings = useCallback(() => {
    setSettings(defaultSettings)
    try {
      localStorage.setItem('app-settings', JSON.stringify(defaultSettings))
    } catch (error) {
      console.error('Failed to reset settings:', error)
    }
  }, [])

  return {
    settings,
    updateSettings,
    resetSettings,
    loading
  }
}
