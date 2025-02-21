import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { UserSettings } from '@/lib/types'

type State = {
  settings: UserSettings;
  updateSettings: (updates: Partial<UserSettings>) => void;
}

export const useSettings = create<State>()(
  persist(
    (set) => ({
      settings: {
        theme: 'system',
        colorTheme: 'blue',
        privacy: {
          adultContent: false,
          publicProfile: true
        },
        navigation: {
          bottomNavItems: ["/", "/messages", "/reels", "/calls"],
          sidebarItems: [
            "/",
            "/messages",
            "/reels",
            "/calls",
            "/ai-assistant",
            "/research",
            "/social",
            "/shopping",
            "/emergency",
            "/payments"
          ],
          quickAccessItems: ["/", "/messages", "/reels"]
        }
      },
      updateSettings: (updates) =>
        set((state) => ({
          settings: { ...state.settings, ...updates },
        })),
    }),
    {
      name: 'user-settings', // Key for localStorage
    }
  )
)
