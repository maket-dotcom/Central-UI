import type { AppSidebarConfig } from "./types"
import { keyboardSidebarConfig } from "./apps/keyboard"

/**
 * Mapping of known backend application names (normalized lowercase) to their frontend route slug.
 */
export const backendFrontendMap = new Map<string, string>([
  ["ikeyboard", "keyboard"],
  ["ikeyboard-dev", "keyboard"],
])

/**
 * Resolves the frontend route slug for a given application name.
 * Normalizes input casing, trims whitespace, and returns the registered slug.
 * If not explicitly mapped, falls back to the normalized app name.
 *
 * @param appName - Backend application name (e.g., "ikeyboard", "iKeyboard-Dev")
 * @returns The frontend route slug (e.g., "keyboard")
 */
export const getAppRoute = (appName?: string | null): string => {
  if (!appName) return ""
  const normalized = appName.trim().toLowerCase()
  if (backendFrontendMap.has(normalized)) {
    return backendFrontendMap.get(normalized)!
  }
  if (normalized.includes("keyboard")) {
    return "keyboard"
  }
  return normalized
}

/**
 * Registry mapping normalized route slugs to their respective sidebar navigation configurations.
 */
export const sidebarMap: Record<string, AppSidebarConfig> = {
  keyboard: keyboardSidebarConfig,
  // Future apps:
  // wallpaper: wallpaperSidebarConfig,
}
