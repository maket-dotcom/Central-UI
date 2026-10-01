# Phase B: API Layer

> **Master Plan:** [Stage 0 README](file:///d:/project/central/Central-UI/docs/stage-0/README.md)  
> **Status:** 🟢 Completed  
> **Prerequisite:** [Phase A](file:///d:/project/central/Central-UI/docs/stage-0/PHASE_A.md) (Scaffolding + Environment) must be complete  
> **Creates:** `src/api/config/types.ts`, `centralApiConfig.ts`, `keyboardApiConfig.ts`, `centralInstance.ts`, `appInstance.ts`, `apiHooks.ts`

---

## Objective

Build the dual-instance API layer: one Axios instance for Central-Backend (static `VITE_SERVER_URL`) and one for the selected app's backend (dynamic `backendBaseUrl` from Zustand). Create per-app endpoint config files and a parameterized `useApi()` hook.

---

## Task 1: Create `api/config/types.ts`

**File:** `src/api/config/types.ts`

Shared interface used by all API config files.

```ts
export interface ApiEndpoint {
  name: string;
  path: string;
  hasPathParams?: boolean;
}
```

**Checklist:**
- [x] B1. Create `src/api/config/types.ts` with `ApiEndpoint` interface

---

## Task 2: Create `api/config/centralApiConfig.ts`

**File:** `src/api/config/centralApiConfig.ts`

Endpoints that hit Central-Backend via `centralInstance`.

```ts
import type { ApiEndpoint } from "./types";

export const centralApiConfig: ApiEndpoint[] = [
  { name: "getApps",    path: "/api/v1/app-info/get" },
  { name: "getAppById", path: "/api/v1/app-info/get/{id}", hasPathParams: true },
  { name: "addApp",     path: "/api/v1/app-info/add" },
  { name: "updateApp",  path: "/api/v1/app-info/update/{id}", hasPathParams: true },
  { name: "deleteApp",  path: "/api/v1/app-info/delete/{id}", hasPathParams: true },
];
```

> [!NOTE]
> These match the Central-Backend routes defined in `Central-Backend/src/modules/appInfo/appInfoRoutes.ts`. The `{id}` placeholders are resolved at runtime by `constructUrl()` in `apiHooks.ts`.

**Checklist:**
- [x] B2. Create `src/api/config/centralApiConfig.ts`

---

## Task 3: Create `api/config/keyboardApiConfig.ts`

**File:** `src/api/config/keyboardApiConfig.ts`

Endpoints that hit the Keyboard app's own backend via `appInstance`. Empty for now — will be populated as keyboard features are built.

```ts
import type { ApiEndpoint } from "./types";

export const keyboardApiConfig: ApiEndpoint[] = [
  // Keyboard app's own endpoints (will be populated as we build features)
  // e.g.: { name: "getThemes", path: "/api/v1/theme" },
];
```

**Checklist:**
- [x] B3. Create `src/api/config/keyboardApiConfig.ts` (empty array for now)

---

## Task 4: Create `api/centralInstance.ts`

**File:** `src/api/centralInstance.ts`

Axios instance for Central-Backend. Uses static `VITE_SERVER_URL` as baseURL.

```ts
import axios from "axios";
import { useAppStore } from "@/store";

const centralInstance = axios.create({
  baseURL: import.meta.env.VITE_SERVER_URL,
  headers: { "Content-Type": "application/json" },
});

// Request interceptor: inject Bearer token from Zustand/localStorage
centralInstance.interceptors.request.use(
  (config) => {
    const token = useAppStore.getState().token;
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: 401/403 → clear session → redirect /login
centralInstance.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      // Clear Zustand state; ProtectedRoute will automatically redirect to /login
      useAppStore.getState().clearAuth();
      useAppStore.getState().clearApp();
    }
    return Promise.reject(error);
  }
);

export default centralInstance;
```

> [!IMPORTANT]
> This file imports from `@/store` which is created in [Phase C+D](file:///d:/project/central/Central-UI/docs/stage-0/PHASE_CD.md). During Phase B, you can create the file with the import — it will compile once the store is in place.

**Checklist:**
- [x] B4. Create `src/api/centralInstance.ts`

---

## Task 5: Create `api/appInstance.ts`

**File:** `src/api/appInstance.ts`

Axios instance for the currently selected app's backend. No static `baseURL` — it reads `selectedApp.backendBaseUrl` from Zustand **on every request**.

```ts
import axios from "axios";
import { useAppStore } from "@/store";

const appInstance = axios.create({
  headers: { "Content-Type": "application/json" },
});

// Request interceptor: set baseURL dynamically + inject token
appInstance.interceptors.request.use(
  (config) => {
    const { token, selectedApp } = useAppStore.getState();
    if (selectedApp?.backendBaseUrl) {
      config.baseURL = selectedApp.backendBaseUrl;
    }
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: 401/403 → clear session → redirect /login
appInstance.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      // Clear Zustand state; ProtectedRoute will automatically redirect to /login
      useAppStore.getState().clearAuth();
      useAppStore.getState().clearApp();
    }
    return Promise.reject(error);
  }
);

export default appInstance;
```

> [!IMPORTANT]
> `appInstance` reads `backendBaseUrl` **on every request** from Zustand, so it automatically points to whichever app is currently selected. No configuration change needed when the user switches apps.

**Checklist:**
- [x] B5. Create `src/api/appInstance.ts`

---

## Task 6: Create `api/apiHooks.ts`

**File:** `src/api/apiHooks.ts`

Parameterized hook — caller picks which config + instance to use.

```ts
import type { ApiEndpoint } from "./config/types";
import type { AxiosInstance, AxiosRequestConfig } from "axios";

export const useApi = (config: ApiEndpoint[], instance: AxiosInstance) => {
  const getEndpoint = (name: string): ApiEndpoint => {
    const endpoint = config.find((e) => e.name === name);
    if (!endpoint) throw new Error(`Endpoint "${name}" not found in config!`);
    return endpoint;
  };

  const constructUrl = (
    endpoint: ApiEndpoint,
    pathParams?: Record<string, string>
  ): string => {
    let url = endpoint.path;
    if (endpoint.hasPathParams && pathParams) {
      Object.keys(pathParams).forEach((param) => {
        url = url.replace(`{${param}}`, pathParams[param]);
      });
    }
    return url;
  };

  const get = async (
    name: string,
    params?: object,
    headers?: object,
    pathParams?: Record<string, string>
  ) => {
    const endpoint = getEndpoint(name);
    const url = constructUrl(endpoint, pathParams);
    const response = await instance.get(url, {
      params,
      headers,
    } as AxiosRequestConfig);
    return response;
  };

  const post = async (
    name: string,
    data?: object,
    headers?: object,
    pathParams?: Record<string, string>
  ) => {
    const endpoint = getEndpoint(name);
    const url = constructUrl(endpoint, pathParams);
    const response = await instance.post(url, data, {
      headers,
    } as AxiosRequestConfig);
    return response;
  };

  const patch = async (
    name: string,
    data?: object,
    headers?: object,
    pathParams?: Record<string, string>
  ) => {
    const endpoint = getEndpoint(name);
    const url = constructUrl(endpoint, pathParams);
    const response = await instance.patch(url, data, {
      headers,
    } as AxiosRequestConfig);
    return response;
  };

  const put = async (
    name: string,
    data?: object,
    headers?: object,
    pathParams?: Record<string, string>
  ) => {
    const endpoint = getEndpoint(name);
    const url = constructUrl(endpoint, pathParams);
    const response = await instance.put(url, data, {
      headers,
    } as AxiosRequestConfig);
    return response;
  };

  const del = async (
    name: string,
    headers?: object,
    pathParams?: Record<string, string>
  ) => {
    const endpoint = getEndpoint(name);
    const url = constructUrl(endpoint, pathParams);
    const response = await instance.delete(url, {
      headers,
    } as AxiosRequestConfig);
    return response;
  };

  return { get, post, patch, put, del };
};
```

**Usage examples (for reference — actual service files are created in Phase C+D):**

```ts
// Central-Backend service
import { useApi } from "@/api/apiHooks";
import { centralApiConfig } from "@/api/config/centralApiConfig";
import centralInstance from "@/api/centralInstance";

const api = useApi(centralApiConfig, centralInstance);
const { data } = await api.get("getApps");
```

```ts
// Keyboard app service
import { useApi } from "@/api/apiHooks";
import { keyboardApiConfig } from "@/api/config/keyboardApiConfig";
import appInstance from "@/api/appInstance";

const api = useApi(keyboardApiConfig, appInstance);
const { data } = await api.get("getThemes");
```

**Checklist:**
- [x] B6. Create `src/api/apiHooks.ts` with full `get`, `post`, `patch`, `put`, `del` methods

---

## Final Directory State After Phase B

```
src/api/
├── config/
│   ├── types.ts              # ApiEndpoint interface
│   ├── centralApiConfig.ts   # Central-Backend endpoints
│   └── keyboardApiConfig.ts  # Keyboard app endpoints (empty for now)
├── centralInstance.ts        # Axios → Central-Backend (VITE_SERVER_URL)
├── appInstance.ts            # Axios → dynamic backendBaseUrl
└── apiHooks.ts               # useApi(config, instance) — parameterized
```

---

## Summary Checklist

```
Phase B: API Layer
  ☑ B1. Create api/config/types.ts (ApiEndpoint interface)
  ☑ B2. Create api/config/centralApiConfig.ts
  ☑ B3. Create api/config/keyboardApiConfig.ts (empty for now)
  ☑ B4. Create api/centralInstance.ts (axios → Central-Backend)
  ☑ B5. Create api/appInstance.ts (axios → dynamic backendBaseUrl)
  ☑ B6. Create api/apiHooks.ts (parameterized useApi with get/post/patch/put/del)
```

> **Next Phase:** [Phase C+D: Store + Services & Queries](file:///d:/project/central/Central-UI/docs/stage-0/PHASE_CD.md)
