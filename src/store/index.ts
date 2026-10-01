import { create } from "zustand"
import { createAuthSlice, type AuthState } from "./slices/AuthSlice"
import { createAppSlice, type AppState } from "./slices/AppSlice"
// Future app slices (e.g. keyboard, wallpaper) will be imported and merged here:
// import { createKeyboardSlice, type KeyboardState } from "./keyboard/KeyboardSlice";

/**
 * Combined Central state interface merging all common and app-scoped slices.
 */
export interface CentralState extends AuthState, AppState {
  // Future: & KeyboardState
}

/**
 * Global Zustand store combining AuthSlice and AppSlice into a single store instance.
 */
export const useAppStore = create<CentralState>()((...args) => ({
  // Spread common auth slice actions and state
  ...createAuthSlice(...args),
  // Spread common app selection slice actions and state
  ...createAppSlice(...args),
  // Future app-scoped slices spread here:
  // ...createKeyboardSlice(...args),
}))
