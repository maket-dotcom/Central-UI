# Phase C+D: Store + Services & Queries

> **Master Plan:** [Stage 0 README](file:///d:/project/central/Central-UI/docs/stage-0/README.md)  
> **Status:** 🟢 Completed  
> **Prerequisite:** [Phase B](file:///d:/project/central/Central-UI/docs/stage-0/PHASE_B.md) (API Layer) must be complete  
> **Creates:** `store/` (AuthSlice, AppSlice, index, keyboard/ placeholder), `services/appInfo.ts`, `services/keyboard/` placeholder, `query/useAppInfo.ts`, `query/keyboard/` placeholder, `utils/queryClient.ts`, `utils/getErrorMessage.ts`

---

## Objective

Set up the Zustand store with common slices (auth + app selection), create the service-query layer for Central-Backend API calls, and add utility files for React Query client and error handling.

---

## Part C: Zustand Store

### Task C1: Create `store/slices/AuthSlice.ts`

**File:** `src/store/slices/AuthSlice.ts`

Manages the auth token. Hydrates from `localStorage` on load. Clears both `localStorage` and in-memory state on logout.

```ts
import { StateCreator } from "zustand";

export interface AuthState {
  token: string | null;
  loadToken: () => void;
  setToken: (token: string) => void;
  clearAuth: () => void;
}

const getInitialToken = (): string | null => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("token");
  }
  return null;
}

export const createAuthSlice: StateCreator<AuthState> = (set) => ({
  token: getInitialToken(),

  loadToken: () => {
    const token = localStorage.getItem("token");
    if (token) {
      set({ token });
    }
  },

  setToken: (token: string) => {
    localStorage.setItem("token", token);
    set({ token });
  },

  clearAuth: () => {
    localStorage.removeItem("token");
    set({ token: null });
  },
});
```

**Checklist:**

- [x] C1. Create `src/store/slices/AuthSlice.ts`

---

### Task C2: Create `store/slices/AppSlice.ts`

**File:** `src/store/slices/AppSlice.ts`

Manages the currently selected app. The `SelectedApp` shape matches what Central-Backend's `/api/v1/app-info/get` returns per app document.

```ts
import { StateCreator } from "zustand";

export interface SelectedApp {
  _id: string;
  appName: string;
  backendBaseUrl: string;
  status: string;
}

export interface AppState {
  selectedApp: SelectedApp | null;
  setSelectedApp: (app: SelectedApp) => void;
  clearApp: () => void;
}

export const createAppSlice: StateCreator<AppState> = (set) => ({
  selectedApp: null,

  setSelectedApp: (app: SelectedApp) => {
    set({ selectedApp: app });
  },

  clearApp: () => {
    set({ selectedApp: null });
  },
});
```

**Checklist:**

- [x] C2. Create `src/store/slices/AppSlice.ts`

---

### Task C3: Create Keyboard Store Placeholder

**Directory:** `src/store/keyboard/`

Create the directory with a `.gitkeep` file. Keyboard-specific Zustand slices will be added here in future stages.

```bash
mkdir -p src/store/keyboard
touch src/store/keyboard/.gitkeep
```

**Checklist:**

- [x] C3. Create `src/store/keyboard/` directory with `.gitkeep`

---

### Task C4: Create `store/index.ts` (Combined Store)

**File:** `src/store/index.ts`

Merges all slices into a single `useAppStore`. Future app slices (keyboard, wallpaper, etc.) are imported and spread here.

```ts
import { create } from "zustand";
import { createAuthSlice, type AuthState } from "./slices/AuthSlice";
import { createAppSlice, type AppState } from "./slices/AppSlice";
// Future: import { createKeyboardSlice, type KeyboardState } from "./keyboard/KeyboardSlice";

interface CentralState extends AuthState, AppState {
  // Future: & KeyboardState
}

export const useAppStore = create<CentralState>()((...args) => ({
  ...createAuthSlice(...args),
  ...createAppSlice(...args),
  // Future: ...createKeyboardSlice(...args),
}));
```

> [!NOTE]
> All keyboard slices merge into the **single global `useAppStore`**. When a new app slice is added in `store/keyboard/`, it's imported and spread into the combined store here.

**Checklist:**

- [x] C4. Create `src/store/index.ts`

---

### Store Directory State After Part C

```
src/store/
├── index.ts             # Combined store (useAppStore)
├── slices/
│   ├── AuthSlice.ts     # token, loadToken(), setToken(), clearAuth()
│   └── AppSlice.ts      # selectedApp, loadApp(), setSelectedApp(), clearApp()
└── keyboard/
    └── .gitkeep         # Placeholder for future keyboard slices
```

---

## Part D: Services, Queries & Utilities

### Task D1: Create `services/appInfo.ts`

**File:** `src/services/appInfo.ts`

Service layer for Central-Backend's app-info endpoints. Uses `centralInstance` + `centralApiConfig`.

```ts
import { createApiClient } from "@/api/apiHooks";
import { centralApiConfig } from "@/api/config/centralApiConfig";
import centralInstance from "@/api/centralInstance";

const api = createApiClient(centralApiConfig, centralInstance);

export const getApps = async (params?: Record<string, unknown>) => {
  const { data } = await api.get("getApps", params);
  return data;
};

export const getAppById = async (id: string) => {
  const { data } = await api.get("getAppById", undefined, undefined, { id });
  return data;
};

export const addApp = async (body: Record<string, unknown>) => {
  const { data } = await api.post("addApp", body);
  return data;
};

export const updateApp = async (id: string, body: Record<string, unknown>) => {
  const { data } = await api.patch("updateApp", body, undefined, { id });
  return data;
};

export const deleteApp = async (id: string) => {
  const { data } = await api.del("deleteApp", undefined, { id });
  return data;
};
```

**Checklist:**

- [x] D1. Create `src/services/appInfo.ts`

---

### Task D2: Create Keyboard Services Placeholder

**Directory:** `src/services/keyboard/`

```bash
mkdir -p src/services/keyboard
touch src/services/keyboard/.gitkeep
```

**Checklist:**

- [x] D2. Create `src/services/keyboard/` directory with `.gitkeep`

---

### Task D3: Create `query/useAppInfo.ts`

**File:** `src/query/useAppInfo.ts`

React Query hooks wrapping the appInfo service functions.

```ts
import { useQuery } from "@tanstack/react-query";
import { getApps } from "@/services/appInfo";

export const useGetApps = (params?: Record<string, unknown>) => {
  return useQuery({
    queryKey: ["apps", params],
    queryFn: () => getApps(params),
  });
};
```

> [!NOTE]
> Additional query hooks (`useGetAppById`, etc.) will be added as needed. For Stage 0, only `useGetApps` is required for the App Selection page.

**Checklist:**

- [x] D3. Create `src/query/useAppInfo.ts`

---

### Task D4: Create Keyboard Queries Placeholder

**Directory:** `src/query/keyboard/`

```bash
mkdir -p src/query/keyboard
touch src/query/keyboard/.gitkeep
```

**Checklist:**

- [x] D4. Create `src/query/keyboard/` directory with `.gitkeep`

---

### Task D5: Create `utils/queryClient.ts`

**File:** `src/utils/queryClient.ts`

Shared React Query client instance used in `main.tsx`.

```ts
import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});
```

**Checklist:**

- [x] D5. Create `src/utils/queryClient.ts`

---

### Task D6: Create `utils/getErrorMessage.ts`

**File:** `src/utils/getErrorMessage.ts`

Utility to extract error messages from Axios errors or unknown exceptions. Used in catch blocks across the app.

```ts
import { AxiosError } from "axios";

export const getErrorMessage = (error: unknown): string => {
  if (error instanceof AxiosError) {
    return (
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      "An unexpected error occurred"
    );
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "An unexpected error occurred";
};
```

**Checklist:**

- [x] D6. Create `src/utils/getErrorMessage.ts`

---

## Final Directory State After Phase C+D

```
src/
├── store/
│   ├── index.ts
│   ├── slices/
│   │   ├── AuthSlice.ts
│   │   └── AppSlice.ts
│   └── keyboard/
│       └── .gitkeep
├── services/
│   ├── appInfo.ts
│   └── keyboard/
│       └── .gitkeep
├── query/
│   ├── useAppInfo.ts
│   └── keyboard/
│       └── .gitkeep
└── utils/
    ├── queryClient.ts
    └── getErrorMessage.ts
```

---

## Summary Checklist

```
Phase C: Store
  [x] C1. Create store/slices/AuthSlice.ts (localStorage)
  [x] C2. Create store/slices/AppSlice.ts (localStorage)
  [x] C3. Create store/keyboard/ directory (empty placeholder)
  [x] C4. Create store/index.ts (combined store)

Phase D: Services & Queries
  [x] D1. Create services/appInfo.ts (uses centralInstance)
  [x] D2. Create services/keyboard/ directory (empty placeholder)
  [x] D3. Create query/useAppInfo.ts
  [x] D4. Create query/keyboard/ directory (empty placeholder)
  [x] D5. Create utils/queryClient.ts
  [x] D6. Create utils/getErrorMessage.ts
```

> **Next Phase:** [Phase E+F: Configuration + Components](file:///d:/project/central/Central-UI/docs/stage-0/PHASE_EF.md)
