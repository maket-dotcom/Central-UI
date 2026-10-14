import { Outlet, Navigate } from "react-router-dom"
import ProtectedRoute from "@/routes/protected-route"
import { appSelectionConfig } from "./appSelection/app-selection-config"
import { appManageConfig } from "./manage/app-manage-config"

/**
 * Central Platform Application Routes.
 * Serves as the parent route for the Central application workspace:
 * - /apps (Catalog landing screen)
 * - /apps/manage (Application Management table)
 *
 * All child routes are guarded by ProtectedRoute.
 */
export const CentralAppRoutes = {
  path: "/apps",
  element: (
    <ProtectedRoute>
      <Outlet />
    </ProtectedRoute>
  ),
  children: [
    // Default catalog view (/apps)
    appSelectionConfig,

    // App Management (/apps/manage)
    appManageConfig,

    // Catch-all for unknown /apps/* routes
    { path: "*", element: <Navigate to="/apps" replace /> },
  ],
}

export default CentralAppRoutes
