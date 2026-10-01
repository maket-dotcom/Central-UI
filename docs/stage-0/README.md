# Central-UI — Stage 0: Project Initialization

> **Status:** 🟢 Completed  
> **Full Reference:** [stage-0-plan.md](file:///d:/project/central/Central-UI/docs/stage-0/stage-0-plan.md)  
> **Target Directory:** `d:\project\central\Central-UI`  
> **Tech Stack:** Vite + React + TypeScript + shadcn/ui + Zustand + React Query + Axios + React Router

---

## Goal

Bootstrap Central-UI with an **app-scoped folder architecture** — separate API configs, pages, services, queries, and store slices per app (e.g., `keyboard/`) while keeping common/central pieces at the top level.

---

## High-Level Flow

```text
[ 1. Login Page (/login) ]
       │ (User pastes token & clicks "LogIn")
       ▼
[ Verify via Central-Backend: GET /api/v1/app-info/get ]
       ├─── (Failed / 401) ──► [ Show Error Toast (Stay on /login) ]
       │
       └─── (200 OK: Valid Token)
              ▼
[ Store token in localStorage + Zustand ]
              ▼
[ 2. App Selection Page (/apps) ]
       │ (Displays grid of available apps)
       │ (User clicks an app card, e.g. "Keyboard")
       ▼
[ Store selectedApp in localStorage + Zustand ]
              ▼
[ Navigate to /:appName/home (e.g. /keyboard/home) ]
              ▼
[ 3. Dashboard Shell ]
  ├── Top Site Header
  ├── Dynamic App Sidebar (loaded from sidebarRegistry)
  └── Main Content Outlet (Home Page)
```

---

## Execution Phases

| Phase | Title | Files Created | Status |
|-------|-------|---------------|--------|
| **A** | [Scaffolding + Environment](file:///d:/project/central/Central-UI/docs/stage-0/PHASE_A.md) | Project init, npm packages, `.env`, `vite.config.ts` | 🟢 Completed |
| **B** | [API Layer](file:///d:/project/central/Central-UI/docs/stage-0/PHASE_B.md) | `api/config/types.ts`, `centralApiConfig.ts`, `keyboardApiConfig.ts`, `centralInstance.ts`, `appInstance.ts`, `apiHooks.ts` | 🟢 Completed |
| **C+D** | [Store + Services & Queries](file:///d:/project/central/Central-UI/docs/stage-0/PHASE_CD.md) | `store/` (AuthSlice, AppSlice, index), `services/appInfo.ts`, `query/useAppInfo.ts`, `utils/` | 🟢 Completed |
| **E+F** | [Configuration + Components](file:///d:/project/central/Central-UI/docs/stage-0/PHASE_EF.md) | `configurations/`, `app/appData.ts`, shadcn components, inputComponents/, mediaComponents/, layout shell | 🟢 Completed |
| **G+H+I** | [Pages + Routing + App Root](file:///d:/project/central/Central-UI/docs/stage-0/PHASE_GHI.md) | `pages/` (login, app-selection, keyboard home), `routes/` (router, guards), `App.tsx`, `main.tsx` | 🟢 Completed |
| **J** | [Verification](file:///d:/project/central/Central-UI/docs/stage-0/PHASE_J.md) | No new files — testing & validation checklist | 🟢 Completed |

---

## Key Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| **API configs** | Per-app files: `centralApiConfig.ts`, `keyboardApiConfig.ts` | Clean separation; each app's endpoints are isolated |
| **Axios instances** | Two: `centralInstance` (static URL) + `appInstance` (dynamic URL) | Central-Backend vs app-specific backend are different servers |
| **apiHooks** | Parameterized: `useApi(config, instance)` | Single hook logic, flexible per-caller |
| **Pages** | `pages/auth/`, `pages/appSelection/` (common) + `pages/apps/keyboard/` (scoped) | Clear separation of common vs app-specific UI |
| **Routing** | Modular configs: `router.tsx` (central) + `keyboard-routes.tsx` (scoped) | Safe, isolated app routing and clean central router |
| **Services/Queries** | Top-level for common + `keyboard/` subfolder for scoped | Scales to more apps: `services/appX/`, `query/appX/` |
| **Store** | `store/slices/` (common) + `store/keyboard/` (scoped), all in single `useAppStore` | One global store keeps state access simple |
| **Storage** | `localStorage` for token. `selectedApp` is purely in-memory | Tab independence for selectedApp, persistent auth token |
| **Sidebar** | `sidebarRegistry` + per-app config file | Easy to add new apps |

---

## Adding a New App in the Future

| Step | What to create/update |
|------|----------------------|
| 1 | `api/config/wallpaperApiConfig.ts` — new endpoint registry |
| 2 | `configurations/apps/wallpaper.ts` — sidebar config |
| 3 | `sidebarRegistry.ts` — register the new sidebar |
| 4 | `pages/apps/wallpaper/` — app-specific pages |
| 5 | `services/wallpaper/` — app-specific services |
| 6 | `query/wallpaper/` — app-specific queries |
| 7 | `store/wallpaper/` — app-specific slices (if needed) |
| 8 | `store/index.ts` — merge new slices |
| 9 | `router.tsx` — add new app-specific route configs (e.g., `KeyboardAppRoutes`) |

No changes needed to `appInstance.ts`, `apiHooks.ts`, or the layout — they work generically.
