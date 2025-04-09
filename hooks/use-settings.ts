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
        isAdultContentEnabled: false,
        dateOfBirth: undefined,
        theme: 'system',
        notifications: {
          email: true,
          push: false,
          sms: false,
        },
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
