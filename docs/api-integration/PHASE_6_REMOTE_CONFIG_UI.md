# Phase 6: Remote Configuration Engine UI

> **Master Plan:** [Integration README](file:///d:/project/central/Central-UI/docs/api-integration/README.md)  
> **Status:** 🟢 Completed  
> **Affects:** `src/pages/apps/keyboard/remoteConfig/`  
> **Design Decisions:** Option A (Grouped Namespace Cards with Platform Tabs) + C Hybrid (Dedicated Editor Page) + Code Editor Component

---

## 1. Objective

Build the administrative dashboard for Remote Configuration in `src/pages/apps/keyboard/remoteConfig/`. Implements grouped cards by namespace, platform tabs (`All`, `Android`, `iOS`), full-page configuration editor with interactive JSON code editing, version snapshot audit history drawer, and 1-click version rollbacks.

---

## 2. Component Structure

```text
src/pages/apps/keyboard/remoteConfig/
├── remote-config-config.tsx                  # Route configuration aggregator (/keyboard/remote-config/*)
├── configList/
│   ├── remote-config-list-config.tsx         # Lazy loader + Suspense container for list view
│   └── remote-config-list.tsx                # Grouped cards by namespace with platform sub-tabs
├── configEditor/
│   ├── remote-config-editor-config.tsx       # Lazy loader + Suspense containers for create & edit
│   └── remote-config-editor.tsx              # Full-page create & edit view (JsonEditorComponent)
├── configHistory/
│   └── remote-config-history-drawer.tsx      # Slide-out Sheet for historical versions & rollback
└── delete-config.tsx                         # Delete configuration confirmation dialog
```

---

## 3. Task 1: Create Route Configurations

### `src/pages/apps/keyboard/remoteConfig/configList/remote-config-list-config.tsx`

```typescript
import React, { Suspense } from "react"
import Loader from "@/components/loader"

const RemoteConfigList = React.lazy(() => import("./remote-config-list"))

const RemoteConfigListContainer: React.FC = () => {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50vh] flex-1 items-center justify-center">
          <Loader size={32} />
        </div>
      }
    >
      <RemoteConfigList />
    </Suspense>
  )
}

const RemoteConfigListConfig = {
  path: "/keyboard/remote-config/list",
  element: <RemoteConfigListContainer />,
}

export default RemoteConfigListConfig
```

### `src/pages/apps/keyboard/remoteConfig/configEditor/remote-config-editor-config.tsx`

```typescript
import React, { Suspense } from "react"
import Loader from "@/components/loader"

const RemoteConfigEditor = React.lazy(() => import("./remote-config-editor"))

const CreateConfigContainer: React.FC = () => {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50vh] flex-1 items-center justify-center">
          <Loader size={32} />
        </div>
      }
    >
      <RemoteConfigEditor isCreate />
    </Suspense>
  )
}

const EditConfigContainer: React.FC = () => {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50vh] flex-1 items-center justify-center">
          <Loader size={32} />
        </div>
      }
    >
      <RemoteConfigEditor />
    </Suspense>
  )
}

export const RemoteConfigCreateConfig = {
  path: "/keyboard/remote-config/create",
  element: <CreateConfigContainer />,
}

export const RemoteConfigEditConfig = {
  path: "/keyboard/remote-config/edit/:namespace/:platform",
  element: <EditConfigContainer />,
}
```

### `src/pages/apps/keyboard/remoteConfig/remote-config-config.tsx`

Clean route aggregator matching `campaign-config.tsx`:

```typescript
import { Navigate } from "react-router-dom"
import RemoteConfigListConfig from "./configList/remote-config-list-config"
import {
  RemoteConfigCreateConfig,
  RemoteConfigEditConfig,
} from "./configEditor/remote-config-editor-config"

export const RemoteConfigConfig = {
  path: "/keyboard/remote-config",
  title: "Remote Config",
  children: [
    {
      index: true,
      element: <Navigate to="/keyboard/remote-config/list" replace />,
    },
    RemoteConfigListConfig,
    RemoteConfigCreateConfig,
    RemoteConfigEditConfig,
    {
      path: "*",
      element: <Navigate to="/keyboard/remote-config/list" replace />,
    },
  ],
}

export default RemoteConfigConfig
```

---

## 4. Task 2: Create Grouped Cards View (Option A)

**File:** `src/pages/apps/keyboard/remoteConfig/configList/remote-config-list.tsx`

### Visual Grouping Pattern:
1. All documents returned by `GET /api/v1/admin/configs/list` are grouped in memory by `namespace` (e.g. `keyboard`, `theme`, `haptics`).
2. Each namespace renders a card:
   - Header with Namespace title and "New Override" / "Add Platform" button.
   - Segmented Tabs:
     - `All (Baseline)`: Displays baseline keys and version badge.
     - `Android (Override)`: Displays Android-specific keys (or "No override configured").
     - `iOS (Override)`: Displays iOS-specific keys (or "No override configured").
   - Action toolbar per tab:
     - **Edit Configuration**: Navigates to `/keyboard/remote-config/edit/:namespace/:platform`.
     - **Version History & Rollback**: Opens `RemoteConfigHistoryDrawer`.
     - **Delete Override**: Opens `DeleteConfigDialog`.

---

## 5. Task 3: Create Dedicated Editor Page

**File:** `src/pages/apps/keyboard/remoteConfig/configEditor/remote-config-editor.tsx`

Features:
- Route param resolution: extracts `:namespace` and `:platform`.
- Reads active config via `useGetConfig({ namespace, platform })`.
- Form inputs:
  - `namespace` (read-only when editing).
  - `platform` selector (`all`, `android`, `ios`).
  - `minBuildNumber` and `maxBuildNumber` integer inputs with tooltips.
  - Interactive `JsonEditorComponent` for `values`.
- **Optimistic Locking Guard**:
  - Automatically captures `currentConfig.version`.
  - When saving, sends `expectedVersion: currentConfig.version` (or `0` on create).
  - If server returns `409 Conflict`, the mutation's `onError` displays a clear alert toast: *"Version Conflict: Configuration modified by another admin. Please refresh and review before saving."*

---

## 6. Task 4: Create Audit History & Rollback Drawer

**File:** `src/pages/apps/keyboard/remoteConfig/configHistory/remote-config-history-drawer.tsx`

Features:
- Slide-out Sheet (`src/components/ui/sheet.tsx`) triggered by the "History" button.
- Calls `useGetConfigHistory({ namespace, platform })` fetching up to 50 version snapshots.
- Displays chronological timeline:
  - Version number badge (`v4`, `v3`, `v2`, `v1`).
  - Author (`updatedBy`) and formatted timestamp.
  - Expandable snapshot values JSON view.
  - Prominent **"Rollback to vX"** confirmation button triggering `useRollbackConfig`.

---

## 7. Execution Checklist

- [x] 6.1 Create `remote-config-config.tsx` with list and editor routes.
- [x] 6.2 Create `remote-config-list.tsx` with Option A Namespace cards and platform tabs.
- [x] 6.3 Create `remote-config-editor.tsx` integrating `JsonEditorComponent` and optimistic locking.
- [x] 6.4 Create `remote-config-history-drawer.tsx` with version timeline and 1-click rollback.
- [x] 6.5 Create `delete-config.tsx` confirmation modal.
