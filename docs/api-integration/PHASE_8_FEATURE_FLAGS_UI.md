# Phase 8: Feature Flags Engine UI

> **Master Plan:** [Integration README](file:///d:/project/central/Central-UI/docs/api-integration/README.md)  
> **Status:** 🟢 Completed  
> **Affects:** `src/pages/apps/keyboard/features/`  
> **Design Decisions:** C Hybrid (Dedicated Create & Update Route Pages) + Inline Master Switch + Lowercase Key Enforcement + Code Editor Component

---

## 1. Objective

Build the Feature Flag administration interface under `src/pages/apps/keyboard/features/`. Implements interactive table rows with 1-click toggling, rollout progress bars, targeting badges, sortable columns, and dedicated full-page forms for configuring 7-gate targeting rules.

---

## 2. Component Structure

```text
src/pages/apps/keyboard/features/
├── feature-config.tsx                  # Route registration aggregator (/keyboard/features/*)
├── featureList/
│   ├── feature-list-config.tsx         # Lazy loader + Suspense container for list view
│   └── feature-list.tsx                # Table view with inline master switch & badges
├── addFeature/
│   ├── add-feature-config.tsx          # Lazy loader + Suspense container for add view
│   └── add-feature.tsx                 # Full-page create flag form
├── updateFeature/
│   ├── update-feature-config.tsx       # Lazy loader + Suspense container for edit view
│   └── update-feature.tsx              # Full-page edit flag form (key locked)
└── delete-feature.tsx                  # Delete feature confirmation dialog
```

---

## 3. Task 1: Create Route Configurations

### Subfolder Route Configurations with Suspense & Loader:
- `featureList/feature-list-config.tsx`: Loads `./feature-list` inside `<Suspense fallback={<Loader size={32} />}>` for path `/keyboard/features/list`.
- `addFeature/add-feature-config.tsx`: Loads `./add-feature` inside `<Suspense fallback={<Loader size={32} />}>` for path `/keyboard/features/add`.
- `updateFeature/update-feature-config.tsx`: Loads `./update-feature` inside `<Suspense fallback={<Loader size={32} />}>` for path `/keyboard/features/update/:key`.

### `src/pages/apps/keyboard/features/feature-config.tsx`

Clean route aggregator matching `campaign-config.tsx`:

```typescript
import { Navigate } from "react-router-dom"
import FeatureListConfig from "./featureList/feature-list-config"
import AddFeatureConfig from "./addFeature/add-feature-config"
import UpdateFeatureConfig from "./updateFeature/update-feature-config"

export const FeatureConfig = {
  path: "/keyboard/features",
  title: "Feature Flags",
  children: [
    {
      index: true,
      element: <Navigate to="/keyboard/features/list" replace />,
    },
    FeatureListConfig,
    AddFeatureConfig,
    UpdateFeatureConfig,
    {
      path: "*",
      element: <Navigate to="/keyboard/features/list" replace />,
    },
  ],
}

export default FeatureConfig
```

---

## 4. Task 2: Create Table with Inline Master Toggle

**File:** `src/pages/apps/keyboard/features/featureList/feature-list.tsx`

Features:
- Search input filter by feature key or description.
- Column sorting via `useTableSort`:
  - **Key**: Alphabetical sort (A &rarr; Z / Z &rarr; A).
  - **Created At**: Date sort.
- **Inline Master Switch**:
  - Clicking the Switch component in the table cell immediately triggers:
    ```typescript
    updateFeatureMutation.mutate({
      key: flag.key,
      body: { enabled: !flag.enabled },
    })
    ```
- Rollout indicator bar:
  - Grey bar for 0%.
  - Blue bar for 1–99%.
  - Emerald green bar for 100%.
- Targeting badges:
  - Platforms: `Android`, `iOS`.
  - Channels: `Internal`, `Beta`, `Prod`.
- Actions:
  - Edit (navigates to `/keyboard/features/update/:key`).
  - Delete (opens `DeleteFeatureDialog`).

---

## 5. Task 3: Create Dedicated Add Feature Page

**File:** `src/pages/apps/keyboard/features/addFeature/add-feature.tsx`

Features:
- Form fields organized into clear sections:
  1. **Core Identity**:
     - Key input: Enforces lowercase snake_case `/^[a-z0-9_-]+$/`.
     - Description textarea.
     - Master Switch toggle.
  2. **Targeting Pipeline (Gates 4 & 5)**:
     - Platform checkboxes (`Android`, `iOS`).
     - Channel checkboxes (`Internal`, `Beta`, `Production`).
  3. **Build Thresholds (Gate 6)**:
     - 2x2 grid for Android Min/Max build numbers and iOS Min/Max build numbers.
  4. **Rollout Slider (Gate 7)**:
     - 0–100% interactive slider with preset quick-buttons: `10%`, `25%`, `50%`, `100%`.
  5. **Device Overrides (Gates 2 & 3)**:
     - Allow Devices list using [MultiStringComponent](file:///d:/project/central/Central-UI/src/components/inputComponents/multi-string-component.tsx) (max 50 tags).
     - Deny Devices list using [MultiStringComponent](file:///d:/project/central/Central-UI/src/components/inputComponents/multi-string-component.tsx) (max 50 tags).
  6. **Custom Payload**:
     - Interactive [JsonEditorComponent](file:///d:/project/central/Central-UI/src/components/inputComponents/json-editor-component.tsx) with JSON validation and beautify.
- Calls `useCreateFeature()` and navigates to `/keyboard/features/list` on success.

---

## 6. Task 4: Create Dedicated Update Feature Page

**File:** `src/pages/apps/keyboard/features/updateFeature/update-feature.tsx`

Features:
- Resolves `:key` from URL and calls `useGetFeatureByKey(key)`.
- **Key Locking**: Feature Key is permanently disabled/read-only.
- Pre-populates all targeting rules, thresholds, device override tags, and JSON payload.
- Calls `useUpdateFeature()` and navigates to list on success.

---

## 7. Execution Checklist

- [x] 8.1 Create `feature-config.tsx` with nested list, create, and update routes.
- [x] 8.2 Create `feature-list.tsx` with 1-click inline master switch and sortable columns.
- [x] 8.3 Create `add-feature.tsx` with lowercase key validator, 7-gate inputs, `MultiStringComponent`, and `JsonEditorComponent`.
- [x] 8.4 Create `update-feature.tsx` with immutable key lock.
- [x] 8.5 Create `delete-feature.tsx` confirmation modal.
