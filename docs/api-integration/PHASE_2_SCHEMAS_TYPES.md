# Phase 2: Zod Schemas & TypeScript Types

> **Master Plan:** [Integration README](file:///d:/project/central/Central-UI/docs/api-integration/README.md)  
> **Status:** 🟢 Completed  
> **Affects:** `src/utils/schemas/keyboard/`  
> **Compliance:** Zod v4 Standards ([ARCHITECTURE.md Section 4](file:///d:/project/central/Central-UI/docs/ARCHITECTURE.md#4-zod-validation-v4-standards))

---

## 1. Objective

Define schema validation and TypeScript interfaces in `src/utils/schemas/keyboard/`. Follow modern Zod v4 syntax (specifically `z.string().pipe(z.url())` for URLs) and strict type inference.

---

## 2. Task 1: Create `testerSchema.ts`

**File:** `src/utils/schemas/keyboard/testerSchema.ts`

```typescript
import { z } from "zod"

export const testerChannelEnum = z.enum(["internal", "beta"])
export type TesterChannel = z.infer<typeof testerChannelEnum>

export interface Tester {
  _id: string
  deviceId: string
  channel: TesterChannel
  name?: string
  createdAt: string
  updatedAt: string
}

export const upsertTesterSchema = z.object({
  deviceId: z
    .string()
    .trim()
    .min(1, "Device ID is required")
    .max(100, "Device ID must be under 100 characters"),
  channel: testerChannelEnum,
  name: z.string().trim().max(100, "Name must be under 100 characters").optional(),
})

export type UpsertTesterInputs = z.infer<typeof upsertTesterSchema>
```

---

## 3. Task 2: Create `remoteConfigSchema.ts`

**File:** `src/utils/schemas/keyboard/remoteConfigSchema.ts`

```typescript
import { z } from "zod"

export const configPlatformEnum = z.enum(["all", "android", "ios"])
export type ConfigPlatform = z.infer<typeof configPlatformEnum>

export interface RemoteConfigDoc {
  _id: string
  namespace: string
  platform: ConfigPlatform
  values: Record<string, unknown>
  minBuildNumber?: number
  maxBuildNumber?: number
  version: number
  updatedBy: string
  createdAt: string
  updatedAt: string
}

export interface ConfigHistoryDoc {
  _id: string
  namespace: string
  platform: ConfigPlatform
  version: number
  values: Record<string, unknown>
  minBuildNumber?: number
  maxBuildNumber?: number
  updatedBy: string
  createdAt: string
}

const validateConfigKeys = (obj: unknown): boolean => {
  if (obj === null || typeof obj !== "object") return true
  for (const key of Object.keys(obj as Record<string, unknown>)) {
    if (key.startsWith("$") || key.includes(".")) {
      return false
    }
    const val = (obj as Record<string, unknown>)[key]
    if (typeof val === "object" && !validateConfigKeys(val)) {
      return false
    }
  }
  return true
}

export const putConfigSchema = z.object({
  namespace: z
    .string()
    .trim()
    .min(1, "Namespace is required")
    .regex(/^[a-zA-Z0-9_-]+$/, "Namespace must be alphanumeric, hyphens, or underscores"),
  platform: configPlatformEnum,
  values: z
    .record(z.string(), z.unknown(), {
      required_error: "Values object is required",
    })
    .refine((val) => validateConfigKeys(val), {
      message: 'Config keys cannot start with "$" or contain "."',
    }),
  minBuildNumber: z.coerce.number().int().positive("Min build number must be positive").optional(),
  maxBuildNumber: z.coerce.number().int().positive("Max build number must be positive").optional(),
  expectedVersion: z.number().int().min(0).optional(),
})

export const rollbackConfigSchema = z.object({
  version: z.number().int().positive("Version must be a positive integer"),
})

export type PutConfigInputs = z.infer<typeof putConfigSchema>
export type RollbackConfigInputs = z.infer<typeof rollbackConfigSchema>
```

---

## 4. Task 3: Create `releaseSchema.ts`

**File:** `src/utils/schemas/keyboard/releaseSchema.ts`

```typescript
import { z } from "zod"

export const releasePlatformEnum = z.enum(["android", "ios"])
export const releaseChannelEnum = z.enum(["internal", "beta", "production"])
export const releaseStatusEnum = z.enum(["draft", "active", "paused", "archived"])

export type ReleasePlatform = z.infer<typeof releasePlatformEnum>
export type ReleaseChannel = z.infer<typeof releaseChannelEnum>
export type ReleaseStatus = z.infer<typeof releaseStatusEnum>

export interface Release {
  _id: string
  platform: ReleasePlatform
  channel: ReleaseChannel
  version: string
  buildNumber: number
  downloadUrl: string
  changelog?: string
  minBuildNumber?: number
  forceUpdate: boolean
  rolloutPercentage: number
  status: ReleaseStatus
  createdAt: string
  updatedAt: string
}

export const createReleaseSchema = z.object({
  platform: releasePlatformEnum,
  channel: releaseChannelEnum,
  version: z
    .string()
    .trim()
    .min(1, "Display version is required (e.g. 1.2.0)")
    .regex(/^v?\d+(\.\d+)*$/, "Must be a valid semver display format (e.g. 1.2.0)"),
  buildNumber: z.coerce
    .number()
    .int("Build number must be an integer")
    .positive("Build number must be a positive integer"),
  downloadUrl: z
    .string()
    .trim()
    .min(1, "Download URL is required")
    .pipe(z.url({ message: "Download URL must be a valid URL" })),
  changelog: z.string().trim().optional(),
  minBuildNumber: z.coerce.number().int().positive("Min build number must be a positive integer").optional(),
  forceUpdate: z.boolean().default(false),
  rolloutPercentage: z.coerce.number().int().min(0).max(100).default(100),
  status: releaseStatusEnum.default("draft"),
})

export const patchReleaseSchema = createReleaseSchema
  .omit({ platform: true, version: true })
  .partial()
  .refine(
    (data) => Object.keys(data).length > 0,
    { message: "At least one field must be provided for update" }
  )

export type CreateReleaseInputs = z.infer<typeof createReleaseSchema>
export type PatchReleaseInputs = z.infer<typeof patchReleaseSchema>
```

---

## 5. Task 4: Create `featureSchema.ts`

**File:** `src/utils/schemas/keyboard/featureSchema.ts`

```typescript
import { z } from "zod"

export const featurePlatformEnum = z.enum(["android", "ios"])
export const featureChannelEnum = z.enum(["internal", "beta", "production"])

export type FeaturePlatform = z.infer<typeof featurePlatformEnum>
export type FeatureChannel = z.infer<typeof featureChannelEnum>

export interface FeatureFlag {
  _id: string
  key: string
  description?: string
  enabled: boolean
  platforms?: FeaturePlatform[]
  channels?: FeatureChannel[]
  minBuildNumber?: {
    android?: number
    ios?: number
  }
  maxBuildNumber?: {
    android?: number
    ios?: number
  }
  rolloutPercentage: number
  allowDevices?: string[]
  denyDevices?: string[]
  payload?: Record<string, unknown>
  createdAt: string
  updatedAt: string
}

const buildThresholdSchema = z
  .object({
    android: z.coerce.number().int().positive("Android build number must be positive").optional(),
    ios: z.coerce.number().int().positive("iOS build number must be positive").optional(),
  })
  .optional()

export const createFeatureSchema = z.object({
  key: z
    .string()
    .trim()
    .min(1, "Feature key is required")
    .regex(/^[a-z0-9_-]+$/, "Key must contain lowercase letters, numbers, hyphens, or underscores"),
  description: z.string().trim().optional(),
  enabled: z.boolean().default(false),
  platforms: z.array(featurePlatformEnum).default([]),
  channels: z.array(featureChannelEnum).default([]),
  minBuildNumber: buildThresholdSchema,
  maxBuildNumber: buildThresholdSchema,
  rolloutPercentage: z.coerce.number().int().min(0).max(100).default(100),
  allowDevices: z.array(z.string().trim().min(1)).max(50, "Max 50 devices allowed").default([]),
  denyDevices: z.array(z.string().trim().min(1)).max(50, "Max 50 devices allowed").default([]),
  payload: z.record(z.string(), z.unknown()).optional(),
})

export const patchFeatureSchema = createFeatureSchema
  .omit({ key: true })
  .partial()
  .refine(
    (data) => Object.keys(data).length > 0,
    { message: "At least one field must be provided for update" }
  )

export type CreateFeatureInputs = z.infer<typeof createFeatureSchema>
export type PatchFeatureInputs = z.infer<typeof patchFeatureSchema>
```

---

## 6. Execution Checklist

- [x] 2.1 Create `src/utils/schemas/keyboard/testerSchema.ts` with channel enum & upsert validation.
- [x] 2.2 Create `src/utils/schemas/keyboard/remoteConfigSchema.ts` with Mongo key sanitizer (`$`, `.`) & optimistic versioning.
- [x] 2.3 Create `src/utils/schemas/keyboard/releaseSchema.ts` using `z.string().pipe(z.url())` & immutable platform/version in PATCH.
- [x] 2.4 Create `src/utils/schemas/keyboard/featureSchema.ts` with lowercase snake_case enforcement & 7-gate rule types.
