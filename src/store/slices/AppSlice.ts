import type { StateCreator } from "zustand"

/**
 * Shape of the selected app returned by Central-Backend (/api/v1/app-info/get).
 */
export interface SelectedApp {
  _id: string
  appName: string
  backendBaseUrl: string
  status: string
}

/**
 * State and actions for the currently active app workspace.
 */
export interface AppState {
  /** Currently selected app configuration, or null if on app-selection screen */
  selectedApp: SelectedApp | null
  /** Set selected app in-memory state */
  setSelectedApp: (app: SelectedApp) => void
  /** Clear selected app in-memory state */
  clearApp: () => void
}

/**
 * Zustand slice managing the active app selection.
 */
export const createAppSlice: StateCreator<AppState> = (set) => ({
  // Default to null
  selectedApp: null,

  // Save selected app to reactive Zustand state
  setSelectedApp: (app: SelectedApp) => {
    set({ selectedApp: app })
  },

  // Clear selected app on logout or when switching back to /apps
  clearApp: () => {
    set({ selectedApp: null })
  },
})
