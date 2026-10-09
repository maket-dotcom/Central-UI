# Central-UI — Keyboard Management Suite API Integration

> **Target Directory:** `d:\project\central\Central-UI`  
> **Status:** 🟡 Planned / Ready for Execution  
> **Backend Service:** `iKeyboard-backend` (`/api/v1/admin/*`)  
> **Tech Stack:** React 19 + TypeScript + Vite + shadcn/ui + TanStack Query v5 + Zustand v5 + Axios + Zod v4 + React Router v7  
> **Guidelines Compliance:** Strictly adheres to [Central-UI Architecture & Coding Guidelines](file:///d:/project/central/Central-UI/docs/ARCHITECTURE.md)

---

## 1. Executive Summary & Goals

This project integrates four critical release-engineering and runtime-control subsystems from `iKeyboard-backend` into the `Central-UI` administration panel for the **Keyboard** application:

1. **Tester Device Management (`/api/v1/admin/testers/*`)**: Enrollment and channel assignment (`internal` / `beta`) of hardware test devices by persistent `deviceId`.
2. **Remote Configuration Engine (`/api/v1/admin/configs/*`)**: Namespace-driven dynamic app configuration with platform inheritance (`all` &rarr; `android` / `ios` overrides), build gating, optimistic locking (`expectedVersion`), and 1-click rollback history.
3. **Release & Update Delivery (`/api/v1/admin/releases/*`)**: In-app build distribution across platforms and channels, with integer build gating, gradual rollouts (0–100%), and force-update cascade rules.
4. **Feature Flags Engine (`/api/v1/admin/features/*`)**: 7-gate runtime toggle pipeline with master switches, allow/deny device lists, platform/channel filters, platform-segregated min/max build limits, and deterministic FNV-1a rollout bucketing.

---

## 2. Architecture & Design Alignment

Based on architectural alignment, the following design decisions are locked:

| Design Dimension | Selected Strategy | Rationale & Implementation Details |
| :--- | :--- | :--- |
| **View / Navigation Paradigm** | **Hybrid Model (Option C)** | - **Testers**: Modal dialog (lightweight 3-field CRUD stays on table).<br/>- **Releases, Features, Remote Config**: Dedicated route pages (`/create`, `/update/:id` or `/edit/:namespace/:platform`) matching existing Campaign architecture. |
| **Remote Config View** | **Grouped Cards by Namespace (Option A)** | Namespace cards (e.g. `keyboard`, `theme`, `ai`) containing sub-tabs for `All (Baseline)`, `Android (Override)`, and `iOS (Override)` for clear hierarchical inheritance. |
| **JSON Payload / Config Editor** | **Dedicated Code Editor Component** | Custom interactive JSON Editor component with syntax validation, formatting/beautification, line numbers, and error callouts. |
| **Feature Flag Keys** | **Strict Lowercase Snake-Case** | Enforce `/^[a-z0-9_-]+$/` on UI validation for clean cross-platform consistency. |
| **Table Sorting** | **Interactive Client-Side Column Sorting** | All table views provide sorting (e.g. Releases sortable by `buildNumber` or `createdAt`; Features sortable by `key` or `createdAt`). |
| **API Client Method Signatures** | **Sequenced Parameter Passing** | Calling `apiClient.ts` methods in strict parameter order: `del(name, undefined, pathParams)`, `put(name, body, undefined, pathParams)`, `get(name, params, undefined, pathParams)`. |
| **Cache Invalidation** | **Strict Query Key Hierarchies** | Granular cache keys for targeted invalidation (e.g. `["remoteConfig"]`, `["remoteConfig", namespace, platform]`, `["features"]`, `["releases"]`, `["testers"]`). |

---

## 3. High-Level System Architecture

```text
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                   Central-UI                                    │
│                                                                                 │
│  [ Pages & Views ]                                                              │
│  ├── Testers Page (Table + Modal Dialog)                                        │
│  ├── Remote Config Page (Namespace Cards + Tab Overrides + History Drawer)       │
│  ├── Releases Page (Filterable Table + Dedicated Create/Update Pages)           │
│  └── Feature Flags Page (Interactive Table + Dedicated Create/Update Pages)     │
│                             │                                                   │
│                             ▼                                                   │
│  [ TanStack Query Layer (src/query/keyboard/*) ]                                │
│  ├── useTester.ts          (useGetTesters, useUpsertTester, useDeleteTester)    │
│  ├── useRemoteConfig.ts    (useGetConfigs, usePutConfig, useRollbackConfig)     │
│  ├── useRelease.ts         (useGetReleases, useCreateRelease, useUpdateRelease) │
│  └── useFeature.ts         (useGetFeatures, useCreateFeature, useUpdateFeature) │
│                             │                                                   │
│                             ▼                                                   │
│  [ Service Layer (src/services/keyboard/*) ]                                    │
│  Accepts single destructured object payload: { body, params, pathParams }        │
│                             │                                                   │
│                             ▼                                                   │
│  [ Axios apiClient + appInstance (src/api/*) ]                                  │
│  Injects dynamic baseURL (selectedApp.backendBaseUrl) + x-admin-key token       │
└─────────────────────────────────────┬───────────────────────────────────────────┘
                                      │ HTTP REST (X-Admin-Key)
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              iKeyboard-backend                                  │
│  ├── /api/v1/admin/testers/*       (Tester Device Registry)                     │
│  ├── /api/v1/admin/configs/*       (Remote Config & Version Snapshots)          │
│  ├── /api/v1/admin/releases/*      (Mobile In-App Update Engine)                │
│  └── /api/v1/admin/features/*      (7-Gate Feature Flag Pipeline)               │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Execution Phases

| Phase | Title | Scope & Key Deliverables | Status |
| :---: | :--- | :--- | :---: |
| **1** | [Phase 1: API Configuration & Services](file:///d:/project/central/Central-UI/docs/api-integration/PHASE_1_API_SERVICES.md) | Endpoint definitions in `keyboardApiConfig.ts`, typed services in `services/keyboard/` | 🟢 Completed |
| **2** | [Phase 2: Zod Schemas & TypeScript Types](file:///d:/project/central/Central-UI/docs/api-integration/PHASE_2_SCHEMAS_TYPES.md) | Zod v4 schemas & TypeScript types in `utils/schemas/keyboard/` | 🟢 Completed |
| **3** | [Phase 3: React Query Hooks Layer](file:///d:/project/central/Central-UI/docs/api-integration/PHASE_3_QUERY_HOOKS.md) | Hooks with toast notifications and cache invalidation in `query/keyboard/` | 🟢 Completed |
| **4** | [Phase 4: Shared & Input Components](file:///d:/project/central/Central-UI/docs/api-integration/PHASE_4_SHARED_COMPONENTS.md) | Interactive JSON code editor component and table column sorting utilities | 🟢 Completed |
| **5** | [Phase 5: Tester Device Management UI](file:///d:/project/central/Central-UI/docs/api-integration/PHASE_5_TESTERS_UI.md) | Tester table, copy device ID, channel badges, modal dialog CRUD | 🟢 Completed |
| **6** | [Phase 6: Remote Configuration UI](file:///d:/project/central/Central-UI/docs/api-integration/PHASE_6_REMOTE_CONFIG_UI.md) | Namespace cards, platform tabs, dedicated editor page, history drawer & rollback | 🟢 Completed |
| **7** | [Phase 7: Release Management UI](file:///d:/project/central/Central-UI/docs/api-integration/PHASE_7_RELEASES_UI.md) | Release table with filters, dedicated create/update routes, rollout progress bar | 🟢 Completed |
| **8** | [Phase 8: Feature Flags UI](file:///d:/project/central/Central-UI/docs/api-integration/PHASE_8_FEATURE_FLAGS_UI.md) | Flags table with inline master toggle, dedicated create/update routes, 7-gate inputs | 🟢 Completed |
| **9** | [Phase 9: Navigation & Routing Registration](file:///d:/project/central/Central-UI/docs/api-integration/PHASE_9_NAVIGATION_ROUTING.md) | Dynamic sidebar configuration and React Router route trees | 🟢 Completed |
| **10** | [Phase 10: Verification & Quality Assurance](file:///d:/project/central/Central-UI/docs/api-integration/PHASE_10_VERIFICATION.md) | Type-check, linting, error-state handling, and end-to-end integration checklist | 🟢 Completed |

---

## 5. Strict Coding Rules Reference

Developers executing these phases must adhere to:
1. **Destructured Object Payload Pattern**: Every service and React Query mutation must accept strictly **one destructured object argument** (e.g. `({ body }: { body: ... })`).
2. **Explicit Arrow Functions in Mutations**: `mutationFn: (payload) => service(payload)` (never pass bare function reference).
3. **Zod v4 Pipe Syntax**: Use `z.string().pipe(z.url())` instead of deprecated `z.string().url()`.
4. **No Cascading Re-renders**: Derive UI state in render rather than calling synchronous `setState` in `useEffect`.
5. **No Direct Service Imports in UI**: UI views only consume hooks from `src/query/keyboard/*`.
6. **Subfolder Route Config & Suspense Container Pattern**: Follow the established `campaign` module architecture (`Layout.tsx` lacks a global `<Suspense>` around `<Outlet />`). Every lazy-loaded view must have a co-located `*-config.tsx` defining a container with `<Suspense fallback={<div className="flex min-h-[50vh] flex-1 items-center justify-center"><Loader size={32} /></div>}>`. Parent module configs (`*-config.tsx`) act strictly as clean route aggregators without inline JSX or unwrapped lazy imports.
