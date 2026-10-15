import type { AppSidebarConfig } from "./types"
import { sidebarMap, getAppRoute } from "./appRegistry"

export { sidebarMap }

/**
 * Resolves the sidebar configuration for a given app name.
 * Normalizes input name and resolves through the app routing map (e.g. "ikeyboard" -> "keyboard").
 *
 * @param appName - Name of the selected app (e.g. "ikeyboard", "Keyboard")
 * @returns The matching AppSidebarConfig or null if unconfigured
 */
export const getSidebarConfig = (appName: string): AppSidebarConfig | null => {
  const normalizedSlug = appName.toLowerCase()
  const workspaceType = getAppRoute(appName)
  const baseConfig =
    sidebarMap[workspaceType] || sidebarMap[normalizedSlug] || null
  if (!baseConfig) return null

  // Rewrite leading "/keyboard" prefix in URLs to the current app's slug "/:appName"
  const rewriteUrl = (url: string) =>
    url.replace(/^\/[^/]+/, `/${normalizedSlug}`)

  return {
    ...baseConfig,
    navMain: baseConfig.navMain.map((item) => ({
      ...item,
      url: rewriteUrl(item.url),
      items: item.items?.map((sub) => ({
        ...sub,
        url: rewriteUrl(sub.url),
      })),
    })),
    navSecondary: baseConfig.navSecondary?.map((item) => ({
      ...item,
      url: rewriteUrl(item.url),
    })),
  }
}
