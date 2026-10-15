import { Navigate } from "react-router-dom"
import ProtectedRoute from "@/routes/protected-route"
import AppGuard from "@/routes/app-guard"
import Layout from "@/components/layout"
import { WorkspaceGuard } from "@/routes/workspace-guard"
import { keyboardRoutes } from "@/pages/apps/keyboard/keyboard-routes"
// When wallpaper is introduced, simply import its routes:
// import { wallpaperRoutes } from "@/pages/apps/wallpaper/wallpaper-routes"

/**
 * Shared App Workspace Shell mounted at `/:appName`.
 * Provides common authentication, app validation, and layout chrome across all apps.
 *
 * Child route structure:
 * - index: redirects to /:appName/home
 * - workspace routes: scoped per app type with WorkspaceGuard (each workspace owns its home & modules)
 * - wildcard *: redirects unknown routes to /:appName/home
 */
export const AppWorkspaceRoutes = {
  path: "/:appName",
  element: (
    <ProtectedRoute>
      <AppGuard>
        <Layout />
      </AppGuard>
    </ProtectedRoute>
  ),
  children: [
    // 1. Root /:appName -> redirects to /:appName/home
    {
      index: true,
      element: <Navigate to="home" replace />,
    },

    // 2. Keyboard Workspace Routes (includes home + all feature modules)
    {
      element: <WorkspaceGuard workspace="keyboard" />,
      children: keyboardRoutes,
    },

    // 4. Future: Wallpaper Application Modules
    // {
    //   element: <WorkspaceGuard workspace="wallpaper" />,
    //   children: wallpaperRoutes,
    // },

    // 5. Catch-all invalid app sub-path -> redirects back to /:appName/home
    {
      path: "*",
      element: <Navigate to="../home" replace />,
    },
  ],
}

export default AppWorkspaceRoutes
