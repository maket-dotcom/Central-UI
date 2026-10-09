# Phase 7: Release Management UI

> **Master Plan:** [Integration README](file:///d:/project/central/Central-UI/docs/api-integration/README.md)  
> **Status:** 🟢 Completed  
> **Affects:** `src/pages/apps/keyboard/releases/`  
> **Design Decisions:** C Hybrid (Dedicated Create & Update Route Pages) + Sortable Table Columns

---

## 1. Objective

Build the In-App Updates and Release Delivery interface under `src/pages/apps/keyboard/releases/`. Provides filterable release lists, client-side sorting by build number or creation date, status badges, force update indicators, rollout progress bars, and dedicated pages for publishing and modifying releases.

---

## 2. Component Structure

```text
src/pages/apps/keyboard/releases/
├── release-config.tsx                  # Route registration aggregator (/keyboard/releases/*)
├── releaseList/
│   ├── release-list-config.tsx         # Lazy loader + Suspense container for list view
│   └── release-list.tsx                # Table with filters, sortable columns, progress bars
├── addRelease/
│   ├── add-release-config.tsx          # Lazy loader + Suspense container for add view
│   └── add-release.tsx                 # Full-page create release build form
├── updateRelease/
│   ├── update-release-config.tsx       # Lazy loader + Suspense container for edit view
│   └── update-release.tsx              # Full-page edit release form (platform & version locked)
└── delete-release.tsx                  # Delete release confirmation dialog
```

---

## 3. Task 1: Create Route Configurations

### Subfolder Route Configurations with Suspense & Loader:
- `releaseList/release-list-config.tsx`: Loads `./release-list` inside `<Suspense fallback={<Loader size={32} />}>` for path `/keyboard/releases/list`.
- `addRelease/add-release-config.tsx`: Loads `./add-release` inside `<Suspense fallback={<Loader size={32} />}>` for path `/keyboard/releases/add`.
- `updateRelease/update-release-config.tsx`: Loads `./update-release` inside `<Suspense fallback={<Loader size={32} />}>` for path `/keyboard/releases/update/:id`.

### `src/pages/apps/keyboard/releases/release-config.tsx`

Clean route aggregator matching `campaign-config.tsx`:

```typescript
import { Navigate } from "react-router-dom"
import ReleaseListConfig from "./releaseList/release-list-config"
import AddReleaseConfig from "./addRelease/add-release-config"
import UpdateReleaseConfig from "./updateRelease/update-release-config"

export const ReleaseConfig = {
  path: "/keyboard/releases",
  title: "Releases",
  children: [
    {
      index: true,
      element: <Navigate to="/keyboard/releases/list" replace />,
    },
    ReleaseListConfig,
    AddReleaseConfig,
    UpdateReleaseConfig,
    {
      path: "*",
      element: <Navigate to="/keyboard/releases/list" replace />,
    },
  ],
}

export default ReleaseConfig
```

---

## 4. Task 2: Create Filterable & Sortable Release List

**File:** `src/pages/apps/keyboard/releases/releaseList/release-list.tsx`

Features:
- Filter toolbar:
  - Platform Select (`All`, `Android`, `iOS`).
  - Channel Select (`All`, `Internal`, `Beta`, `Production`).
  - Status Select (`All`, `Draft`, `Active`, `Paused`, `Archived`).
- Column Sorting via `useTableSort`:
  - **Build Number**: Clickable header toggles between ascending, descending, or default.
  - **Created At**: Clickable header toggles date sorting.
- Visual Badges:
  - Status: `active` (emerald-100/emerald-800), `draft` (slate-100/slate-800), `paused` (amber-100/amber-800), `archived` (zinc-100/zinc-700).
  - Channel: `internal` (indigo), `beta` (amber), `production` (emerald).
  - Force Update: Red badge `MANDATORY` if `forceUpdate` is true.
  - Rollout: Progress bar displaying `0–100%`.
- Actions:
  - Edit (navigates to `/keyboard/releases/update/:id`).
  - Delete (opens `DeleteReleaseDialog`).

---

## 5. Task 3: Create Dedicated Add Release Page

**File:** `src/pages/apps/keyboard/releases/addRelease/add-release.tsx`

Features:
- Form fields:
  - Platform (`android` / `ios`) segmented toggle.
  - Channel (`internal` / `beta` / `production`) select.
  - Display Version input (semver formatted, e.g. `2.4.0`).
  - Integer Build Number input (e.g. `125`).
  - Download URL input (validated via `z.string().pipe(z.url())`).
  - Minimum Build Number input with tooltip: *"Client builds older than this will receive a mandatory force-update prompt."*
  - Force Update Switch toggle.
  - Rollout Percentage slider (0 to 100%).
  - Changelog multiline textarea.
  - Status Select (defaults to `draft`).
- React Hook Form with `zodResolver(createReleaseSchema)`.
- Calls `useCreateRelease()` and navigates back to list on success.

---

## 6. Task 4: Create Dedicated Update Release Page

**File:** `src/pages/apps/keyboard/releases/updateRelease/update-release.tsx`

Features:
- Fetches release details via `useGetReleaseById(id)`.
- **Immutable Gating**: Platform and Version inputs are permanently disabled (as required by backend architecture).
- Allows editing:
  - Lifecycle Status (e.g. promoting `draft` &rarr; `active` or `paused`).
  - Rollout Percentage (gradually ramping from 10% &rarr; 100%).
  - Minimum Build Number and Force Update flag.
  - Download URL and Changelog notes.
- Calls `useUpdateRelease()` and navigates back to list on success.

---

## 7. Execution Checklist

- [x] 7.1 Create `release-config.tsx` with nested list, create, and update routes.
- [x] 7.2 Create `release-list.tsx` supporting filters and sortable columns (`buildNumber`, `createdAt`).
- [x] 7.3 Create `add-release.tsx` with full release validation and tooltips.
- [x] 7.4 Create `update-release.tsx` with immutable platform/version guards.
- [x] 7.5 Create `delete-release.tsx` confirmation modal.
