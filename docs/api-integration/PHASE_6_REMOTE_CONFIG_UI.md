# Phase 6: Remote Configuration Engine UI

> **Master Plan:** [Integration README](file:///d:/project/central/Central-UI/docs/api-integration/README.md)  
> **Status:** 🟢 Completed  
> **Affects:** `src/pages/apps/keyboard/remoteConfig/`  
> **Architecture:** Simplified Version-Based Remote Config (Platform + `minBuildNumber` compound model)  
> **Design Consistency:** Strictly aligned with Releases (`src/pages/apps/keyboard/releases/`) and Feature Flags (`src/pages/apps/keyboard/features/`)

---

## 1. Objective

Build the administrative dashboard for Remote Configuration in `src/pages/apps/keyboard/remoteConfig/`.
Replaced the overcomplicated namespace/inheritance/history model with a clean, deterministic **Version-Tiered Model**:
- Direct document mapping per `(platform, minBuildNumber)`.
- Seamless unified table view with search, platform filter (`All`, `Android`, `iOS`), and column sorting.
- Active build window computation (`Build #25+ (Latest)`, `Build #10 – #24`).
- Full-page dedicated 3-card editor with [JsonEditorComponent](file:///d:/project/central/Central-UI/src/components/inputComponents/json-editor-component.tsx) and built-in duplicate workflow.
- Contextual operations guide drawer via [HelpButton](file:///d:/project/central/Central-UI/src/components/helpTour/help-button.tsx).

---

## 2. Component Structure

```text
src/pages/apps/keyboard/remoteConfig/
├── remote-config-config.tsx                  # Route configuration aggregator (/keyboard/remote-config/*)
├── configList/
│   ├── remote-config-list-config.tsx         # Lazy loader + Suspense container for list view
│   └── remote-config-list.tsx                # Harmonized table view, platform filters, sorting & duplicate
├── configEditor/
│   ├── remote-config-editor-config.tsx       # Lazy loader + Suspense containers for create & edit
│   └── remote-config-editor.tsx              # 3-Card editor (Platform/Build, Note, JSON Values Object)
├── components/
│   └── remote-config-help-drawer.tsx         # Slide-out bottom/right drawer for operations guide
├── help/
│   └── remote-config-help-config.tsx         # Comprehensive guide: resolution, rules, playbooks, troubleshooting
└── delete-config.tsx                         # Confirmation dialog for deleting configuration documents
```

---

## 3. Route Configuration

### `src/pages/apps/keyboard/remoteConfig/remote-config-config.tsx`

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

Mounted routes:
- `/keyboard/remote-config/list` &rarr; Remote Config Tier List
- `/keyboard/remote-config/create` &rarr; Create new tier (supports `?cloneFrom=:id` duplication)
- `/keyboard/remote-config/edit/:id` &rarr; Edit existing configuration document

---

## 4. List View (`remote-config-list.tsx`)

Harmonized strictly with `release-list.tsx` and `feature-list.tsx`:
1. **Header**:
   - Title: `Remote Configurations`
   - Count Badge: `{configs.length} configs`
   - Actions: `<HelpButton />`, Refresh button (`RefreshCw` with spin animation), and `<Button><Plus /> New Configuration</Button>`.
2. **Filter Toolbar**:
   - Search input covering build number, note, platform, and JSON keys.
   - Platform filter dropdown using `SelectComponent` (`All Platforms`, `Android`, `iOS`).
3. **Table & Sorting**:
   - Uses `useTableSort` hook with interactive sort indicators for **Platform**, **Minimum Build**, and **Created Date**.
   - Platform badges using Tabler icons (`IconBrandAndroid` and `IconBrandApple`).
   - Dynamic **Active Window** column computing client build coverage per platform.
   - Release note / tag descriptor and total JSON keys count badge.
   - Actions dropdown (`...`) offering:
     - **Edit** &rarr; Navigates to `/keyboard/remote-config/edit/:id`
     - **Duplicate** &rarr; Navigates to `/keyboard/remote-config/create?cloneFrom=:id`
     - **Delete** &rarr; Opens `DeleteConfigDialog`
4. **Operations Drawer & Delete Modal**:
   - `<RemoteConfigHelpDrawer />` providing in-app operational guidance.
   - `<DeleteConfigDialog />` confirming permanent deletion.

---

## 5. Editor View (`remote-config-editor.tsx`)

Harmonized with `add-release.tsx` and `feature-form.tsx`:
1. **Header with Back Navigation & Help**:
   - `<Button variant="ghost" size="icon" onClick={handleCancel}><ArrowLeft className="h-4 w-4" /></Button>` aligned with title and description.
   - Scope badge in edit mode (`{platform} • Build #{minBuildNumber}`).
   - `<HelpButton />` on top-right opening the configuration guide.
2. **Duplication Banner**:
   - Automatically displayed when creating via `?cloneFrom=:id`, indicating source build number and guiding the user to enter the new build target.
3. **3-Card Form Structure**:
   - **Card 1: Target Platform & Minimum Build** (`Sliders` icon): 2-column grid featuring `SelectComponent` for Platform (read-only in edit mode) and integer `Input` for Minimum Build Number (`>= 1`).
   - **Card 2: Release Note / Label** (`FileText` icon): Human-readable note or release tag.
   - **Card 3: Configuration Parameters (JSON)** (`FileCode2` icon): Uses `JsonEditorComponent` supporting arbitrary nested objects, formatting/prettify, clipboard copying, and validation preventing keys starting with `$` or containing `.`.
4. **Validation & Action Bar**:
   - `getFirstFormErrorMessage` toast notification on invalid submit.
   - Responsive action buttons: Primary button with `Loader` spinner (`Create Configuration` / `Save Changes`) and `Cancel` button.

---

## 6. Execution Checklist

- [x] 6.1 Create `remote-config-config.tsx` with list and editor routes.
- [x] 6.2 Implement `remote-config-list.tsx` matching Releases & Feature Flags layout (search, platform filter, sorting).
- [x] 6.3 Implement `remote-config-editor.tsx` with 3-card structure and `JsonEditorComponent`.
- [x] 6.4 Implement `delete-config.tsx` confirmation modal.
- [x] 6.5 Implement `RemoteConfigHelpDrawer` and comprehensive operations guide.
- [x] 6.6 Implement 1-click **Duplicate as New Version** flow pre-filling values for next build tier.
- [x] 6.7 Zero TypeScript errors on `npm run typecheck` and successful production build on `npm run build`.
