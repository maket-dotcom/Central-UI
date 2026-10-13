# Phase 1: API Configuration & Services Layer

> **Master Plan:** [Integration README](file:///d:/project/central/Central-UI/docs/api-integration/README.md)  
> **Status:** 🟢 Completed  
> **Affects:** `src/api/config/keyboardApiConfig.ts`, `src/services/keyboard/`  
> **Compliance:** Destructured Object Payload Pattern ([ARCHITECTURE.md Section 3](file:///d:/project/central/Central-UI/docs/ARCHITECTURE.md#3-the-destructured-object-payload-pattern-strict))

---

## 1. Objective

Register all endpoints for Testers, Remote Config, Releases, and Feature Flags into `keyboardApiConfig.ts`. Create clean, type-safe service modules in `src/services/keyboard/` using `createApiClient` and `appInstance`.

---

## 2. Task 1: Update `keyboardApiConfig.ts`

**File:** `src/api/config/keyboardApiConfig.ts`

Add endpoint configurations with accurate path parameters:

```typescript
import type { ApiEndpoint } from "./types"

export const keyboardApiConfig: ApiEndpoint[] = [
  // Media endpoints
  { name: "uploadMedia", path: "/api/v1/admin/media/upload" },
  { name: "getAllMedias", path: "/api/v1/admin/media/list" },
  { name: "getMediaById", path: "/api/v1/admin/media/{id}", hasPathParams: true },
  { name: "deleteMediaById", path: "/api/v1/admin/media/{id}", hasPathParams: true },
  { name: "deleteManyMedia", path: "/api/v1/admin/media/delete-many" },

  // Campaign endpoints
  { name: "getCampaigns", path: "/api/v1/admin/campaigns/list" },
  { name: "createCampaign", path: "/api/v1/admin/campaigns" },
  { name: "getCampaignById", path: "/api/v1/admin/campaigns/{id}", hasPathParams: true },
  { name: "updateCampaignById", path: "/api/v1/admin/campaigns/{id}", hasPathParams: true },
  { name: "deleteCampaignById", path: "/api/v1/admin/campaigns/{id}", hasPathParams: true },

  // Tester Management endpoints
  { name: "getTesters", path: "/api/v1/admin/testers/list" },
  { name: "upsertTester", path: "/api/v1/admin/testers/{deviceId}", hasPathParams: true },
  { name: "deleteTester", path: "/api/v1/admin/testers/{deviceId}", hasPathParams: true },

  // Remote Config endpoints (Version-Tiered)
  { name: "getRemoteConfigs", path: "/api/v1/admin/remote-configs/list" },
  { name: "getRemoteConfigById", path: "/api/v1/admin/remote-configs/{id}", hasPathParams: true },
  { name: "createRemoteConfig", path: "/api/v1/admin/remote-configs" },
  { name: "updateRemoteConfig", path: "/api/v1/admin/remote-configs/{id}", hasPathParams: true },
  { name: "deleteRemoteConfig", path: "/api/v1/admin/remote-configs/{id}", hasPathParams: true },

  // Release Management endpoints
  { name: "getReleases", path: "/api/v1/admin/releases/list" },
  { name: "createRelease", path: "/api/v1/admin/releases" },
  { name: "getReleaseById", path: "/api/v1/admin/releases/{id}", hasPathParams: true },
  { name: "patchRelease", path: "/api/v1/admin/releases/{id}", hasPathParams: true },
  { name: "deleteRelease", path: "/api/v1/admin/releases/{id}", hasPathParams: true },

  // Feature Flags endpoints
  { name: "getFeatures", path: "/api/v1/admin/features/list" },
  { name: "createFeature", path: "/api/v1/admin/features" },
  { name: "getFeatureByKey", path: "/api/v1/admin/features/{key}", hasPathParams: true },
  { name: "patchFeature", path: "/api/v1/admin/features/{key}", hasPathParams: true },
  { name: "deleteFeature", path: "/api/v1/admin/features/{key}", hasPathParams: true },
]
```

---

## 3. Task 2: Create `src/services/keyboard/tester.ts`

**File:** `src/services/keyboard/tester.ts`

```typescript
import { createApiClient } from "@/api/apiClient"
import { keyboardApiConfig } from "@/api/config/keyboardApiConfig"
import appInstance from "@/api/appInstance"
import type { UpsertTesterInputs } from "@/utils/schemas/keyboard/testerSchema"

const api = createApiClient(keyboardApiConfig, appInstance)

export const getTesters = async () => {
  const { data } = await api.get("getTesters")
  return data
}

export const upsertTester = async ({
  deviceId,
  body,
}: {
  deviceId: string
  body: Omit<UpsertTesterInputs, "deviceId">
}) => {
  const { data } = await api.put("upsertTester", body, undefined, { deviceId })
  return data
}

export const deleteTester = async ({ deviceId }: { deviceId: string }) => {
  const { data } = await api.del("deleteTester", undefined, { deviceId })
  return data
}
```

---

## 4. Task 3: Create `src/services/keyboard/remoteConfig.ts`

**File:** `src/services/keyboard/remoteConfig.ts`

```typescript
import { createApiClient } from "@/api/apiClient"
import { keyboardApiConfig } from "@/api/config/keyboardApiConfig"
import appInstance from "@/api/appInstance"
import type {
  CreateRemoteConfigInputs,
  UpdateRemoteConfigInputs,
  ConfigPlatform,
} from "@/utils/schemas/keyboard/remoteConfigSchema"

const api = createApiClient(keyboardApiConfig, appInstance)

export const getRemoteConfigs = async (params?: { platform?: ConfigPlatform }) => {
  const { data } = await api.get("getRemoteConfigs", params)
  return data
}

export const getRemoteConfigById = async (id: string) => {
  const { data } = await api.get("getRemoteConfigById", undefined, undefined, { id })
  return data
}

export const createRemoteConfig = async (body: CreateRemoteConfigInputs) => {
  const { data } = await api.post("createRemoteConfig", body)
  return data
}

export const updateRemoteConfig = async (
  id: string,
  body: UpdateRemoteConfigInputs
) => {
  const { data } = await api.patch("updateRemoteConfig", body, undefined, { id })
  return data
}

export const deleteRemoteConfig = async (id: string) => {
  const { data } = await api.del("deleteRemoteConfig", undefined, { id })
  return data
}
```

---

## 5. Task 4: Create `src/services/keyboard/release.ts`

**File:** `src/services/keyboard/release.ts`

```typescript
import { createApiClient } from "@/api/apiClient"
import { keyboardApiConfig } from "@/api/config/keyboardApiConfig"
import appInstance from "@/api/appInstance"
import type { CreateReleaseInputs, PatchReleaseInputs } from "@/utils/schemas/keyboard/releaseSchema"

const api = createApiClient(keyboardApiConfig, appInstance)

export const getReleases = async ({
  params,
}: {
  params?: { platform?: string; channel?: string; status?: string }
} = {}) => {
  const { data } = await api.get("getReleases", params)
  return data
}

export const getReleaseById = async ({ id }: { id: string }) => {
  const { data } = await api.get("getReleaseById", undefined, undefined, { id })
  return data
}

export const createRelease = async ({ body }: { body: CreateReleaseInputs }) => {
  const { data } = await api.post("createRelease", body)
  return data
}

export const patchRelease = async ({
  id,
  body,
}: {
  id: string
  body: PatchReleaseInputs
}) => {
  const { data } = await api.patch("patchRelease", body, undefined, { id })
  return data
}

export const deleteRelease = async ({ id }: { id: string }) => {
  const { data } = await api.del("deleteRelease", undefined, { id })
  return data
}
```

---

## 6. Task 5: Create `src/services/keyboard/feature.ts`

**File:** `src/services/keyboard/feature.ts`

```typescript
import { createApiClient } from "@/api/apiClient"
import { keyboardApiConfig } from "@/api/config/keyboardApiConfig"
import appInstance from "@/api/appInstance"
import type { CreateFeatureInputs, PatchFeatureInputs } from "@/utils/schemas/keyboard/featureSchema"

const api = createApiClient(keyboardApiConfig, appInstance)

export const getFeatures = async () => {
  const { data } = await api.get("getFeatures")
  return data
}

export const getFeatureByKey = async ({ key }: { key: string }) => {
  const { data } = await api.get("getFeatureByKey", undefined, undefined, { key })
  return data
}

export const createFeature = async ({ body }: { body: CreateFeatureInputs }) => {
  const { data } = await api.post("createFeature", body)
  return data
}

export const patchFeature = async ({
  key,
  body,
}: {
  key: string
  body: PatchFeatureInputs
}) => {
  const { data } = await api.patch("patchFeature", body, undefined, { key })
  return data
}

export const deleteFeature = async ({ key }: { key: string }) => {
  const { data } = await api.del("deleteFeature", undefined, { key })
  return data
}
```

---

## 7. Execution Checklist

- [x] 1.1 Register Testers, Configs, Releases, and Features in `keyboardApiConfig.ts`.
- [x] 1.2 Create `src/services/keyboard/tester.ts` with destructured payload signatures.
- [x] 1.3 Create `src/services/keyboard/remoteConfig.ts` supporting dual path parameters `{ namespace, platform }`.
- [x] 1.4 Create `src/services/keyboard/release.ts` with filter query support.
- [x] 1.5 Create `src/services/keyboard/feature.ts` with key path parameter resolution.
