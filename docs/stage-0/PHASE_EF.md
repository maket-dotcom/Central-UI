# Phase E+F: Configuration + Components

> **Master Plan:** [Stage 0 README](file:///d:/project/central/Central-UI/docs/stage-0/README.md)  
> **Status:** 🟢 Completed  
> **Prerequisite:** [Phase C+D](file:///d:/project/central/Central-UI/docs/stage-0/PHASE_CD.md) (Store + Services & Queries) must be complete  
> **Creates:** `configurations/` (types, sidebarRegistry, apps/keyboard), `app/appData.ts`, shadcn UI components, inputComponents/ (6 files), mediaComponents/ (3 files), layout shell components (9 files)

---

## Objective

Set up the sidebar configuration system (types, per-app configs, registry), static app metadata, install required shadcn UI components, and copy/adapt reusable components from the Adsshare-app-web project.

---

## Part E: Configuration

### Task E1: Create `configurations/types.ts`

**File:** `src/configurations/types.ts`

Type definitions for the sidebar configuration system.

```ts
export interface SubMenuItem {
  title: string;
  url: string;
}

export interface SidebarMenuItem {
  title: string;
  url: string;
  icon?: React.ComponentType<{ className?: string }>;
  isActive?: boolean;
  items?: SubMenuItem[];
}

export interface AppSidebarConfig {
  navMain: SidebarMenuItem[];
  navSecondary?: SidebarMenuItem[];
}
```

**Checklist:**
- [x] E1. Create `src/configurations/types.ts`

---

### Task E2: Create `configurations/apps/keyboard.ts`

**File:** `src/configurations/apps/keyboard.ts`

Sidebar configuration for the Keyboard app. Currently only has a "Home" item — more will be added as keyboard features are built.

```ts
import { IconHome } from "@tabler/icons-react";
import type { AppSidebarConfig } from "../types";

export const keyboardSidebarConfig: AppSidebarConfig = {
  navMain: [
    {
      title: "Home",
      url: "/keyboard/home",
      icon: IconHome,
    },
    // Future: { title: "Themes", url: "/keyboard/themes", icon: IconPalette },
    // Future: { title: "Settings", url: "/keyboard/settings", icon: IconSettings },
  ],
};
```

**Checklist:**
- [x] E2. Create `src/configurations/apps/keyboard.ts`

---

### Task E3: Create `configurations/sidebarRegistry.ts`

**File:** `src/configurations/sidebarRegistry.ts`

Lookup function that maps `appName` → sidebar config. When adding a new app, register it here.

```ts
import type { AppSidebarConfig } from "./types";
import { keyboardSidebarConfig } from "./apps/keyboard";

const sidebarMap: Record<string, AppSidebarConfig> = {
  keyboard: keyboardSidebarConfig,
  // Future: wallpaper: wallpaperSidebarConfig,
};

export const getSidebarConfig = (appName: string): AppSidebarConfig | null => {
  const normalizedName = appName.toLowerCase();
  return sidebarMap[normalizedName] || null;
};
```

**Checklist:**
- [x] E3. Create `src/configurations/sidebarRegistry.ts`

---

### Task E4: Create `app/appData.ts`

**File:** `src/app/appData.ts`

Static metadata for the Central app itself (not the managed apps).

```ts
export const appData = {
  appName: "Central",
  description: "Central Dashboard for managing mobile apps",
};
```

**Checklist:**
- [x] E4. Create `src/app/appData.ts`

---

### Configuration Directory State After Part E

```
src/
├── configurations/
│   ├── types.ts              # SubMenuItem, SidebarMenuItem, AppSidebarConfig
│   ├── sidebarRegistry.ts    # getSidebarConfig(appName) lookup
│   └── apps/
│       └── keyboard.ts       # Keyboard sidebar config
└── app/
    └── appData.ts            # Static app metadata
```

---

## Part F: Components

### Task F1: Install Required shadcn UI Components

Run the following to install shadcn components needed by the layout shell, input components, and pages:

```bash
npx shadcn@latest add button input card sidebar separator breadcrumb sheet dropdown-menu avatar tooltip collapsible label popover calendar command select badge switch textarea
```

> [!NOTE]
> The exact list may need adjustment after copying components from Adsshare. Run `npx shadcn@latest add <component>` for any missing components discovered during the import audit.

**Checklist:**
- [x] F1. Install shadcn UI components listed above

---

### Task F2: Copy `inputComponents/` from Adsshare

**Source:** `d:\project\Adsshare-app-web\src\components\inputComponents\`  
**Destination:** `src/components/inputComponents/`

**Files to copy (6):**

| File | Purpose |
|------|---------|
| `date-picker-component.tsx` | Date picker input wrapping shadcn calendar |
| `image-select-component.tsx` | Image selection with preview |
| `multi-select-component.tsx` | Multi-select dropdown |
| `multi-string-component.tsx` | Multiple string values input |
| `select-component.tsx` | Single-select dropdown |
| `time-picker-component.tsx` | Time picker input |

```bash
# Copy entire directory
cp -r "d:/project/Adsshare-app-web/src/components/inputComponents" "src/components/inputComponents"
```

**Checklist:**
- [x] F2. Copy all 6 inputComponents files

---

### Task F3: Copy `mediaComponents/` from Adsshare

**Source:** `d:\project\Adsshare-app-web\src\components\mediaComponents\`  
**Destination:** `src/components/mediaComponents/`

**Files to copy (3):**

| File | Purpose |
|------|---------|
| `media-upload.tsx` | File upload handler with preview |
| `multi-drop-box.tsx` | Multiple file drag-and-drop zone |
| `single-drop-box.tsx` | Single file drag-and-drop zone |

```bash
cp -r "d:/project/Adsshare-app-web/src/components/mediaComponents" "src/components/mediaComponents"
```

**Checklist:**
- [x] F3. Copy all 3 mediaComponents files

---

### Task F4: Copy/Adapt Layout Shell Components

**Source:** `d:\project\Adsshare-app-web\src\components\`  
**Destination:** `src/components/`

Copy these individual layout files and adapt them for Central-UI's dynamic sidebar architecture:

| File | Source | Adaptation Needed |
|------|--------|-------------------|
| `layout.tsx` | Adsshare | Change to use `Outlet` from react-router for page content |
| `app-sidebar.tsx` | Adsshare | **Major:** Read `selectedApp.appName` from Zustand → `getSidebarConfig(appName)` → pass to `NavMain` |
| `nav-main.tsx` | Adsshare | Minor: Ensure it accepts `SidebarMenuItem[]` from config |
| `nav-secondary.tsx` | Adsshare | Minor: Adjust props if needed |
| `nav-user.tsx` | Adsshare | Minor: Adjust for Central's user context |
| `site-header.tsx` | Adsshare | Minor: Update title/branding to Central |
| `mode-toggle.tsx` | Adsshare | No changes expected |
| `theme-provider.tsx` | Adsshare | No changes expected |
| `loader.tsx` | Adsshare | No changes expected |

> [!IMPORTANT]
> **`app-sidebar.tsx` is the key file to adapt.** In Adsshare, sidebar config is static. In Central-UI, it must:
> 1. Read `selectedApp.appName` from `useAppStore`
> 2. Call `getSidebarConfig(appName)` from `sidebarRegistry.ts`
> 3. Pass the result to `NavMain` for rendering
>
> This makes the sidebar dynamically change based on which app the user selected.

**Checklist:**
- [x] F4a. Copy `layout.tsx` — adapt to use `<Outlet />` from react-router
- [x] F4b. Copy `app-sidebar.tsx` — adapt for dynamic sidebar via `sidebarRegistry`
- [x] F4c. Copy `nav-main.tsx` — ensure `SidebarMenuItem[]` prop compatibility
- [x] F4d. Copy `nav-secondary.tsx`
- [x] F4e. Copy `nav-user.tsx`
- [x] F4f. Copy `site-header.tsx` — update branding
- [x] F4g. Copy `mode-toggle.tsx`
- [x] F4h. Copy `theme-provider.tsx`
- [x] F4i. Copy `loader.tsx`

---

### Task F5: Audit & Fix Imports

After copying all components, audit every copied file to:

1. **Fix `@/` import paths** — Adsshare and Central-UI both use `@/` but the file tree differs
2. **Install missing shadcn components** — if any `@/components/ui/xxx` import is missing, add it with `npx shadcn@latest add xxx`
3. **Fix type imports** — sidebar types now come from `@/configurations/types` not a local file
4. **Remove Adsshare-specific references** — any app-specific branding, hardcoded routes, or Adsshare-only logic

**Checklist:**
- [x] F5a. Audit all `@/` import paths in copied files
- [x] F5b. Install any missing shadcn UI components
- [x] F5c. Fix sidebar type imports to use `@/configurations/types`
- [x] F5d. Remove Adsshare-specific references

---

## Final Directory State After Phase E+F

```
src/
├── app/
│   └── appData.ts
├── components/
│   ├── ui/                        # shadcn (auto-managed)
│   ├── inputComponents/           # 6 files from Adsshare
│   │   ├── date-picker-component.tsx
│   │   ├── image-select-component.tsx
│   │   ├── multi-select-component.tsx
│   │   ├── multi-string-component.tsx
│   │   ├── select-component.tsx
│   │   └── time-picker-component.tsx
│   ├── mediaComponents/           # 3 files from Adsshare
│   │   ├── media-upload.tsx
│   │   ├── multi-drop-box.tsx
│   │   └── single-drop-box.tsx
│   ├── app-sidebar.tsx            # ★ Adapted for dynamic sidebar
│   ├── layout.tsx                 # ★ Adapted for Outlet
│   ├── site-header.tsx
│   ├── nav-main.tsx
│   ├── nav-secondary.tsx
│   ├── nav-user.tsx
│   ├── mode-toggle.tsx
│   ├── theme-provider.tsx
│   └── loader.tsx
└── configurations/
    ├── types.ts
    ├── sidebarRegistry.ts
    └── apps/
        └── keyboard.ts
```

---

## Summary Checklist

```
Phase E: Configuration
  [x] E1. Create configurations/types.ts
  [x] E2. Create configurations/apps/keyboard.ts
  [x] E3. Create configurations/sidebarRegistry.ts
  [x] E4. Create app/appData.ts

Phase F: Copy Components from Adsshare
  [x] F1. Install required shadcn components
  [x] F2. Copy inputComponents/ (6 files)
  [x] F3. Copy mediaComponents/ (3 files)
  [x] F4. Copy/adapt layout shell components (9 files)
  [x] F5. Audit & fix imports
```

> **Next Phase:** [Phase G+H+I: Pages + Routing + App Root](file:///d:/project/central/Central-UI/docs/stage-0/PHASE_GHI.md)

