import { keyboardHomeConfig } from "./home/home-config"
import CampaignConfig from "./campaign/campaign-config"
import FeatureConfig from "./features/feature-config"
import RemoteConfigConfig from "./remoteConfig/remote-config-config"
import ReleaseConfig from "./releases/release-config"
import TesterConfig from "./testers/tester-config"
import AppGuard from "@/routes/app-guard"
import Layout from "@/components/layout"
import ProtectedRoute from "@/routes/protected-route"
import { Navigate } from "react-router-dom"

export const KeyboardAppRoutes = {
  path: "/keyboard",
  element: (
    <ProtectedRoute>
      <AppGuard expectedAppName="keyboard">
        <Layout />
      </AppGuard>
    </ProtectedRoute>
  ),
  children: [
    // Redirect /keyboard to /keyboard/home
    { index: true, element: <Navigate to="/keyboard/home" replace /> },

    // Core Dashboard & App Modules
    keyboardHomeConfig,
    CampaignConfig,
    FeatureConfig,
    RemoteConfigConfig,
    ReleaseConfig,
    TesterConfig,

    // Catch-all for unknown /keyboard/* routes
    { path: "*", element: <Navigate to="/keyboard/home" replace /> },
  ],
}
