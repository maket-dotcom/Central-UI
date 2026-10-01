import type { StateCreator } from "zustand"

/**
 * State and actions for Central-UI authentication.
 */
export interface AuthState {
  /** Bearer authentication token; null when not logged in */
  token: string | null
  /** Hydrate token from localStorage on application mount */
  loadToken: () => void
  /** Persist token to localStorage and update in-memory state */
  setToken: (token: string) => void
  /** Clear token from localStorage and reset in-memory state */
  clearAuth: () => void
}

const getInitialToken = (): string | null => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("token")
  }
  return null
}

/**
 * Zustand slice managing user authentication state.
 */
export const createAuthSlice: StateCreator<AuthState> = (set) => ({
  // Initialize directly from localStorage
  token: getInitialToken(),

  // Hydrate stored token from localStorage
  loadToken: () => {
    const token = localStorage.getItem("token")
    if (token) {
      set({ token })
    }
  },

  // Store token in localStorage and update reactive Zustand state
  setToken: (token: string) => {
    localStorage.setItem("token", token)
    set({ token })
  },

  // Remove token on logout and reset store state
  clearAuth: () => {
    localStorage.removeItem("token")
    set({ token: null })
  },
})
