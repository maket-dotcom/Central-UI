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

const getInitialSelectedApp = (): SelectedApp | null => {
  if (typeof window !== "undefined") {
    try {
      const stored = sessionStorage.getItem("selectedApp")
      return stored ? JSON.parse(stored) : null
    } catch {
      return null
    }
  }
  return null
}

/**
 * Zustand slice managing the active app selection.
 */
export const createAppSlice: StateCreator<AppState> = (set) => ({
  // Initialize directly from sessionStorage
  selectedApp: getInitialSelectedApp(),

  // Save selected app to reactive Zustand state and sessionStorage
  setSelectedApp: (app: SelectedApp) => {
    try {
      sessionStorage.setItem("selectedApp", JSON.stringify(app))
    } catch {
      // ignore storage quota errors
    }
    set({ selectedApp: app })
  },

  // Clear selected app on logout or when switching back to /apps
  clearApp: () => {
    try {
      sessionStorage.removeItem("selectedApp")
    } catch {
      // ignore storage errors
    }
    set({ selectedApp: null })
  },
})
