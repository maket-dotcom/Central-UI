# Phase 9: Navigation & Routing Registration

> **Master Plan:** [Integration README](file:///d:/project/central/Central-UI/docs/api-integration/README.md)  
> **Status:** 🟢 Completed  
> **Affects:** `src/configurations/apps/keyboard.ts`, `src/pages/apps/keyboard/keyboard-routes.tsx`  
> **Compliance:** Modular Route Configuration & App Sidebar Registry

---

## 1. Objective

Integrate the four new features into the Keyboard application navigation sidebar and register their route subtrees in `keyboard-routes.tsx`.

---

## 2. Task 1: Update Sidebar Navigation Registry

**File:** `src/configurations/apps/keyboard.ts`

Add Tabler icons and navigation items for the new modules:

```typescript
import {
  IconBrandCampaignmonitor,
  IconHome,
  IconToggleLeft,
  IconAdjustments,
  IconRocket,
  IconDeviceMobileCheck,
} from "@tabler/icons-react"
import type { AppSidebarConfig } from "../types"

/**
 * Sidebar navigation configuration for the Keyboard application.
 * Defines main navigation links displayed when the Keyboard workspace is active.
 */
export const keyboardSidebarConfig: AppSidebarConfig = {
  navMain: [
    {
      title: "Home",
      url: "/keyboard/home",
      icon: IconHome,
    },
    {
      title: "Campaign",
      url: "/keyboard/campaign",
      icon: IconBrandCampaignmonitor,
    },
    {
      title: "Feature Flags",
      url: "/keyboard/features",
      icon: IconToggleLeft,
    },
    {
      title: "Remote Config",
      url: "/keyboard/remote-config",
      icon: IconAdjustments,
    },
    {
      title: "Releases",
      url: "/keyboard/releases",
      icon: IconRocket,
    },
    {
      title: "Testers",
      url: "/keyboard/testers",
      icon: IconDeviceMobileCheck,
    },
  ],
}
```

---

## 3. Task 2: Register Route Tree in `keyboard-routes.tsx`

**File:** `src/pages/apps/keyboard/keyboard-routes.tsx`

Mount the modular route configs into the child routes of `KeyboardAppRoutes`:

```typescript
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
```

---

## 4. Execution Checklist

- [x] 9.1 Add Feature Flags, Remote Config, Releases, and Testers navigation items to `keyboardSidebarConfig`.
- [x] 9.2 Mount `FeatureConfig`, `RemoteConfigConfig`, `ReleaseConfig`, and `TesterConfig` inside `keyboard-routes.tsx`.
