# Phase 3: React Query Hooks Layer

> **Master Plan:** [Integration README](file:///d:/project/central/Central-UI/docs/api-integration/README.md)  
> **Status:** 🟢 Completed  
> **Affects:** `src/query/keyboard/`  
> **Compliance:** Destructured Object Payload Pattern & Explicit Arrow Passing ([ARCHITECTURE.md Section 3](file:///d:/project/central/Central-UI/docs/ARCHITECTURE.md#3-the-destructured-object-payload-pattern-strict))

---

## 1. Objective

Implement TanStack Query v5 custom hooks in `src/query/keyboard/` for data synchronization, caching, targeted invalidation, and UI toast alerts.

---

## 2. Task 1: Create `src/query/keyboard/useTester.ts`

**File:** `src/query/keyboard/useTester.ts`

```typescript
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { getErrorMessage } from "@/utils/getErrorMessage"
import {
  getTesters,
  upsertTester,
  deleteTester,
} from "@/services/keyboard/tester"
import type { UpsertTesterInputs } from "@/utils/schemas/keyboard/testerSchema"

export const useGetTesters = ({
  initialized = true,
}: { initialized?: boolean } = {}) => {
  return useQuery({
    queryKey: ["testers"],
    queryFn: () => getTesters(),
    enabled: initialized,
  })
}

export const useUpsertTester = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: {
      deviceId: string
      body: Omit<UpsertTesterInputs, "deviceId">
    }) => upsertTester(payload),
    onSuccess: () => {
      toast.success("Tester device saved successfully")
      queryClient.invalidateQueries({ queryKey: ["testers"] })
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error))
    },
  })
}

export const useDeleteTester = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: { deviceId: string }) => deleteTester(payload),
    onSuccess: () => {
      toast.success("Tester device removed successfully")
      queryClient.invalidateQueries({ queryKey: ["testers"] })
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error))
    },
  })
}
```

---

## 3. Task 2: Create `src/query/keyboard/useRemoteConfig.ts`

**File:** `src/query/keyboard/useRemoteConfig.ts`

```typescript
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { getErrorMessage } from "@/utils/getErrorMessage"
import {
  getConfigs,
  getConfig,
  putConfig,
  deleteConfig,
  getConfigHistory,
  rollbackConfig,
} from "@/services/keyboard/remoteConfig"
import type {
  PutConfigInputs,
  RollbackConfigInputs,
} from "@/utils/schemas/keyboard/remoteConfigSchema"

export const useGetConfigs = ({
  initialized = true,
}: { initialized?: boolean } = {}) => {
  return useQuery({
    queryKey: ["remoteConfigs"],
    queryFn: () => getConfigs(),
    enabled: initialized,
  })
}

export const useGetConfig = ({
  namespace,
  platform,
}: {
  namespace: string
  platform: string
}) => {
  return useQuery({
    queryKey: ["remoteConfig", namespace, platform],
    queryFn: () => getConfig({ namespace, platform }),
    enabled: !!namespace && !!platform,
  })
}

export const usePutConfig = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: {
      namespace: string
      platform: string
      body: Omit<PutConfigInputs, "namespace" | "platform">
    }) => putConfig(payload),
    onSuccess: (_data, payload) => {
      toast.success("Configuration published successfully")
      queryClient.invalidateQueries({ queryKey: ["remoteConfigs"] })
      queryClient.invalidateQueries({
        queryKey: ["remoteConfig", payload.namespace, payload.platform],
      })
      queryClient.invalidateQueries({
        queryKey: ["remoteConfigHistory", payload.namespace, payload.platform],
      })
    },
    onError: (error: any) => {
      if (error?.response?.status === 409) {
        toast.error("Version conflict: Config was modified by another admin. Please refresh and review.")
      } else {
        toast.error(getErrorMessage(error))
      }
    },
  })
}

export const useDeleteConfig = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: { namespace: string; platform: string }) =>
      deleteConfig(payload),
    onSuccess: () => {
      toast.success("Configuration document deleted successfully")
      queryClient.invalidateQueries({ queryKey: ["remoteConfigs"] })
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error))
    },
  })
}

export const useGetConfigHistory = ({
  namespace,
  platform,
  limit = 50,
}: {
  namespace: string
  platform: string
  limit?: number
}) => {
  return useQuery({
    queryKey: ["remoteConfigHistory", namespace, platform, limit],
    queryFn: () => getConfigHistory({ namespace, platform, params: { limit } }),
    enabled: !!namespace && !!platform,
  })
}

export const useRollbackConfig = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: {
      namespace: string
      platform: string
      body: RollbackConfigInputs
    }) => rollbackConfig(payload),
    onSuccess: (_data, payload) => {
      toast.success(`Successfully rolled back to version ${payload.body.version}`)
      queryClient.invalidateQueries({ queryKey: ["remoteConfigs"] })
      queryClient.invalidateQueries({
        queryKey: ["remoteConfig", payload.namespace, payload.platform],
      })
      queryClient.invalidateQueries({
        queryKey: ["remoteConfigHistory", payload.namespace, payload.platform],
      })
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error))
    },
  })
}
```

---

## 4. Task 3: Create `src/query/keyboard/useRelease.ts`

**File:** `src/query/keyboard/useRelease.ts`

```typescript
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { getErrorMessage } from "@/utils/getErrorMessage"
import {
  getReleases,
  getReleaseById,
  createRelease,
  patchRelease,
  deleteRelease,
} from "@/services/keyboard/release"
import type {
  CreateReleaseInputs,
  PatchReleaseInputs,
} from "@/utils/schemas/keyboard/releaseSchema"

export const useGetReleases = ({
  params,
  initialized = true,
}: {
  params?: { platform?: string; channel?: string; status?: string }
  initialized?: boolean
} = {}) => {
  return useQuery({
    queryKey: ["releases", params],
    queryFn: () => getReleases({ params }),
    enabled: initialized,
  })
}

export const useGetReleaseById = (id: string) => {
  return useQuery({
    queryKey: ["releaseById", id],
    queryFn: () => getReleaseById({ id }),
    enabled: !!id,
  })
}

export const useCreateRelease = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: { body: CreateReleaseInputs }) =>
      createRelease(payload),
    onSuccess: () => {
      toast.success("Release build created successfully")
      queryClient.invalidateQueries({ queryKey: ["releases"] })
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error))
    },
  })
}

export const useUpdateRelease = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: { id: string; body: PatchReleaseInputs }) =>
      patchRelease(payload),
    onSuccess: (_data, payload) => {
      toast.success("Release build updated successfully")
      queryClient.invalidateQueries({ queryKey: ["releases"] })
      queryClient.invalidateQueries({ queryKey: ["releaseById", payload.id] })
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error))
    },
  })
}

export const useDeleteRelease = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: { id: string }) => deleteRelease(payload),
    onSuccess: () => {
      toast.success("Release build deleted successfully")
      queryClient.invalidateQueries({ queryKey: ["releases"] })
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error))
    },
  })
}
```

---

## 5. Task 4: Create `src/query/keyboard/useFeature.ts`

**File:** `src/query/keyboard/useFeature.ts`

```typescript
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { getErrorMessage } from "@/utils/getErrorMessage"
import {
  getFeatures,
  getFeatureByKey,
  createFeature,
  patchFeature,
  deleteFeature,
} from "@/services/keyboard/feature"
import type {
  CreateFeatureInputs,
  PatchFeatureInputs,
} from "@/utils/schemas/keyboard/featureSchema"

export const useGetFeatures = ({
  initialized = true,
}: { initialized?: boolean } = {}) => {
  return useQuery({
    queryKey: ["features"],
    queryFn: () => getFeatures(),
    enabled: initialized,
  })
}

export const useGetFeatureByKey = (key: string) => {
  return useQuery({
    queryKey: ["featureByKey", key],
    queryFn: () => getFeatureByKey({ key }),
    enabled: !!key,
  })
}

export const useCreateFeature = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: { body: CreateFeatureInputs }) =>
      createFeature(payload),
    onSuccess: () => {
      toast.success("Feature flag created successfully")
      queryClient.invalidateQueries({ queryKey: ["features"] })
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error))
    },
  })
}

export const useUpdateFeature = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: { key: string; body: PatchFeatureInputs }) =>
      patchFeature(payload),
    onSuccess: (_data, payload) => {
      toast.success("Feature flag updated successfully")
      queryClient.invalidateQueries({ queryKey: ["features"] })
      queryClient.invalidateQueries({ queryKey: ["featureByKey", payload.key] })
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error))
    },
  })
}

export const useDeleteFeature = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: { key: string }) => deleteFeature(payload),
    onSuccess: () => {
      toast.success("Feature flag deleted successfully")
      queryClient.invalidateQueries({ queryKey: ["features"] })
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error))
    },
  })
}
```

---

## 6. Execution Checklist

- [x] 3.1 Create `src/query/keyboard/useTester.ts` with explicit arrow mutations.
- [x] 3.2 Create `src/query/keyboard/useRemoteConfig.ts` with 409 conflict handling & composite key invalidation.
- [x] 3.3 Create `src/query/keyboard/useRelease.ts` with filter-dependent query keys.
- [x] 3.4 Create `src/query/keyboard/useFeature.ts` with targeted key invalidation.
