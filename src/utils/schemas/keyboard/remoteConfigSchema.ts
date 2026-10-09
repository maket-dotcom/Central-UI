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
    .regex(
      /^[a-zA-Z0-9_-]+$/,
      "Namespace must be alphanumeric, hyphens, or underscores"
    ),
  platform: configPlatformEnum,
  values: z
    .record(z.string(), z.unknown(), {
      message: "Values object is required",
    })
    .refine((val) => validateConfigKeys(val), {
      message: 'Config keys cannot start with "$" or contain "."',
    }),
  minBuildNumber: z
    .number()
    .int()
    .positive("Min build number must be positive")
    .optional(),
  maxBuildNumber: z
    .number()
    .int()
    .positive("Max build number must be positive")
    .optional(),
  expectedVersion: z.number().int().min(0).optional(),
})

export const rollbackConfigSchema = z.object({
  version: z.number().int().positive("Version must be a positive integer"),
})

export type PutConfigInputs = z.infer<typeof putConfigSchema>
export type RollbackConfigInputs = z.infer<typeof rollbackConfigSchema>
