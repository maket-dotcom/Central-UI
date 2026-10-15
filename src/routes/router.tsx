import { createBrowserRouter, Navigate } from "react-router-dom"
import { loginConfig } from "@/pages/centralUI/auth/login-config"
import { CentralAppRoutes } from "@/pages/centralUI/central-ui-routes"
import { AppWorkspaceRoutes } from "@/routes/app-workspace-routes"

/**
 * Application routing configuration using React Router DOM.
 * Configures common authentication routes, protected catalog screens,
 * and scoped application layouts with nested child route outlets.
 */
export const router = createBrowserRouter([
  // Common: Public Login Screen (unprotected)
  loginConfig,

  // Central Platform Routes (/apps, /apps/manage)
  CentralAppRoutes,

  // App-Scoped Routes (/:appName/*)
  AppWorkspaceRoutes,

  // Fallback Redirects
  // If a user navigates to the root URL or an unknown route:
  // - Authenticated users will seamlessly land on the App Selection page.
  // - Unauthenticated users will hit the ProtectedRoute guard on `/apps` and automatically bounce to `/login`.
  {
    path: "/",
    element: <Navigate to="/apps" replace />,
  },
  {
    path: "*", // Catch-all for any undefined routes
    element: <Navigate to="/apps" replace />,
  },
])
