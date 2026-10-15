# Central-UI

Central-UI is a unified administrative platform designed to manage multiple mobile and web applications (e.g., **Keyboard**, **Wallpaper**, etc.) through a single, extensible dashboard.

---

## 🏛️ Architecture Overview

Central-UI uses a **multi-tenant workspace architecture**:
- **Dynamic App URLs:** Every managed app is mounted dynamically under `/:appName/*` (e.g., `http://localhost:7001/ikeyboard-dev/features/list` or `http://localhost:7001/iwallpaper-dev/categories/list`).
- **Strict App Validation:** The [AppGuard](file:///d:/project/central/Central-UI/src/routes/app-guard.tsx) verifies `:appName` against registered backend apps. Non-matching apps automatically bounce to `/apps`.
- **Dynamic Layout Shell:** The shared shell provides common authentication, header chrome, dynamic sidebar navigation ([sidebarRegistry](file:///d:/project/central/Central-UI/src/configurations/sidebarRegistry.ts)), and active workspace routing.
- **Workspace Route Isolation:** [WorkspaceGuard](file:///d:/project/central/Central-UI/src/routes/workspace-guard.tsx) prevents cross-app URL tampering (e.g. attempting to open keyboard features on a wallpaper app safely redirects back to `/home`).

---

## 🚀 Adding a New App (e.g. `wallpaper`)

Follow this step-by-step guide whenever you introduce a new application workspace into Central-UI.

```
src/
├── api/config/wallpaperApiConfig.ts            # 1. API Endpoint Configuration
├── configurations/
│   ├── apps/wallpaper.ts                       # 2. Sidebar Navigation Config
│   └── appRegistry.ts                          # 3. App Slug & Sidebar Mapping
├── pages/apps/wallpaper/                       # 4. App Pages & Modules
│   ├── home/                                   #    Home Dashboard (home-config.tsx)
│   ├── categories/                             #    Feature Module
│   ├── themes/                                 #    Feature Module
│   └── wallpaper-routes.tsx                    # 5. Workspace Routes (includes home)
├── routes/
│   └── app-workspace-routes.tsx                # 6. Mount under Shared App Shell
├── services/wallpaper/                         # 7. API Services (Axios)
└── query/wallpaper/                            # 8. React Query Hooks
```

---

### Step 1: Define API Endpoints (`src/api/config/`)

Create `src/api/config/wallpaperApiConfig.ts`:

```typescript
import { createApiConfig, createEndpointConfig } from "./types"

export const wallpaperApiEndpoints = {
  getCategories: createEndpointConfig("/api/v1/categories/get", "get"),
  getThemes: createEndpointConfig("/api/v1/themes/get", "get"),
}

export const wallpaperApiConfig = createApiConfig(
  "https://api.wallpaper.app", // Default/fallback URL
  wallpaperApiEndpoints
)

export default wallpaperApiConfig
```

---

### Step 2: Configure Sidebar Navigation (`src/configurations/apps/`)

Create `src/configurations/apps/wallpaper.ts`:

```typescript
import { LayoutDashboard, FolderTree, Palette } from "lucide-react"
import type { AppSidebarConfig } from "../types"

export const wallpaperSidebarConfig: AppSidebarConfig = {
  appName: "Wallpaper",
  menuItems: [
    {
      title: "Home",
      url: "/wallpaper/home",
      icon: LayoutDashboard,
    },
    {
      title: "Categories",
      url: "/wallpaper/categories/list",
      icon: FolderTree,
    },
    {
      title: "Themes",
      url: "/wallpaper/themes/list",
      icon: Palette,
    },
  ],
}
```

> **Note:** Paths can use a `/wallpaper` template prefix. The sidebar registry automatically rewrites `/wallpaper/...` to match the active app slug `/:appName/...` at runtime.

---

### Step 3: Register App in `appRegistry.ts`

Open [src/configurations/appRegistry.ts](file:///d:/project/central/Central-UI/src/configurations/appRegistry.ts):

1. Map backend application names to the `"wallpaper"` workspace key:
```typescript
export const backendFrontendMap = new Map<string, string>([
  ["ikeyboard", "keyboard"],
  ["ikeyboard-dev", "keyboard"],
  // Add new app mappings:
  ["iwallpaper", "wallpaper"],
  ["iwallpaper-dev", "wallpaper"],
])
```

2. Register the sidebar config in `sidebarMap`:
```typescript
import { wallpaperSidebarConfig } from "./apps/wallpaper"

export const sidebarMap: Record<string, AppSidebarConfig> = {
  keyboard: keyboardSidebarConfig,
  wallpaper: wallpaperSidebarConfig, // Registered
}
```

---

### Step 4: Create Workspace Pages & Modules (`src/pages/apps/wallpaper/`)

Create feature module folders inside `src/pages/apps/wallpaper/`:
- `home/` (Dashboard overview)
- `categories/`
- `themes/`

Each module should follow the standard **`path` and `children`** structure:

```tsx
// src/pages/apps/wallpaper/categories/category-config.tsx
import { Navigate } from "react-router-dom"
import CategoryListConfig from "./categoryList/category-list-config"
import AddCategoryConfig from "./addCategory/add-category-config"

export const CategoryConfig = {
  path: "categories",
  title: "Categories",
  children: [
    // 1. Module root redirects to list
    { index: true, element: <Navigate to="list" replace /> },

    CategoryListConfig,
    AddCategoryConfig,

    // 2. Invalid sub-path redirects up one level back to list
    { path: "*", element: <Navigate to="../list" replace /> },
  ],
}

export default CategoryConfig
```

---

### Step 5: Export Workspace Routes (`wallpaper-routes.tsx`)

Create `src/pages/apps/wallpaper/wallpaper-routes.tsx` containing the Home config and all feature module configs:

```tsx
import { wallpaperHomeConfig } from "./home/home-config"
import CategoryConfig from "./categories/category-config"
import ThemeConfig from "./themes/theme-config"

/**
 * Feature module routes specific to the Wallpaper workspace (including Home dashboard).
 */
export const wallpaperRoutes = [
  wallpaperHomeConfig, // Self-contained Home dashboard
  CategoryConfig,
  ThemeConfig,
]

export default wallpaperRoutes
```

---

### Step 6: Mount Routes in `app-workspace-routes.tsx`

Open [src/routes/app-workspace-routes.tsx](file:///d:/project/central/Central-UI/src/routes/app-workspace-routes.tsx) and mount `wallpaperRoutes` under `AppWorkspaceRoutes.children`:

```tsx
import { wallpaperRoutes } from "@/pages/apps/wallpaper/wallpaper-routes"

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
    { index: true, element: <Navigate to="home" replace /> },

    // Keyboard Application Workspace (includes Home + modules)
    {
      element: <WorkspaceGuard workspace="keyboard" />,
      children: keyboardRoutes,
    },

    // Wallpaper Application Workspace (includes Home + modules)
    {
      element: <WorkspaceGuard workspace="wallpaper" />,
      children: wallpaperRoutes,
    },

    { path: "*", element: <Navigate to="../home" replace /> },
  ],
}
```

---

### Step 8: Create Services & Queries (Optional/As Needed)

1. **Services:** Create `src/services/wallpaper/wallpaperService.ts` using `appInstance` (which automatically targets the backend base URL of the active app).
2. **React Query:** Create hooks in `src/query/wallpaper/useWallpaper.ts`.
3. **Zustand Store:** If app-specific global state is required, add a slice in `src/store/wallpaper/` and merge it into `src/store/index.ts`.

---

## 📌 Route Redirection Standard Reference

| Route Level | Route Pattern | Element | Purpose |
| :--- | :--- | :--- | :--- |
| **Top App Shell** | `/:appName` (`index: true`) | `<Navigate to="home" replace />` | `/ikeyboard-dev` $\rightarrow$ `/ikeyboard-dev/home` |
| **Top App Shell** | `/:appName/*` | `<Navigate to="../home" replace />` | `/ikeyboard-dev/invalid` $\rightarrow$ `/ikeyboard-dev/home` |
| **Module Root** | `/:appName/module` (`index: true`) | `<Navigate to="list" replace />` | `.../features` $\rightarrow$ `.../features/list` |
| **Module Subpath** | `/:appName/module/*` | `<Navigate to="../list" replace />` | `.../features/xyz` $\rightarrow$ `.../features/list` |
| **Cross-App Leak** | Guard mismatch in `WorkspaceGuard` | `<Navigate to={`/${appName}/home`} replace />` | `/wallpaper/features` $\rightarrow$ `/wallpaper/home` |
| **Unregistered App** | Mismatch in `AppGuard` | `<Navigate to="/apps" replace />` | `/invalid-app/home` $\rightarrow$ `/apps` |