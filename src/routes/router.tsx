import { createBrowserRouter, Navigate } from "react-router-dom"
import LoginPage from "@/pages/auth/login"
import AppSelectionPage from "@/pages/appSelection/app-selection"
import ProtectedRoute from "@/routes/protected-route"
import { KeyboardAppRoutes } from "@/pages/apps/keyboard/keyboard-routes"

/**
 * Application routing configuration using React Router DOM.
 * Configures common authentication routes, protected catalog screens,
 * and scoped application layouts with nested child route outlets.
 */
export const router = createBrowserRouter([
  // Common: Public Login Screen (unprotected)
  {
    path: "/login",
    element: <LoginPage />,
  },

  // Common: Application Catalog (protected by auth token)
  {
    path: "/apps",
    element: (
      <ProtectedRoute>
        <AppSelectionPage />
      </ProtectedRoute>
    ),
  },

  // App-Scoped Routes
  KeyboardAppRoutes,
  // Future apps will be added here (e.g., VanshavaliAppRoutes)

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
