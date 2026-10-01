import type { AppSidebarConfig } from "./types";
import { keyboardSidebarConfig } from "./apps/keyboard";

/**
 * Registry mapping normalized application names to their respective sidebar navigation structures.
 * New apps register their sidebar configs here.
 */
const sidebarMap: Record<string, AppSidebarConfig> = {
  keyboard: keyboardSidebarConfig,
  // Future apps:
  // wallpaper: wallpaperSidebarConfig,
};

/**
 * Resolves the sidebar configuration for a given app name.
 * Normalizes input name to lower case for resilient lookup.
 *
 * @param appName - Name of the selected app (e.g. "Keyboard")
 * @returns The matching AppSidebarConfig or null if unconfigured
 */
export const getSidebarConfig = (appName: string): AppSidebarConfig | null => {
  const normalizedName = appName.toLowerCase();
  return sidebarMap[normalizedName] || null;
};
