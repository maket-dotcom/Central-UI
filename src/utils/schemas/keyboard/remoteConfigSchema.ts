import { z } from "zod"

export const configPlatformEnum = z.enum(["android", "ios"])
export type ConfigPlatform = z.infer<typeof configPlatformEnum>

export interface RemoteConfigDoc {
  _id: string
  platform: ConfigPlatform
  minBuildNumber: number
  note?: string
  values: Record<string, unknown>
  updatedBy: string
  createdAt: string
  updatedAt: string
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

export const createRemoteConfigSchema = z.object({
  platform: configPlatformEnum,
  minBuildNumber: z
    .number()
    .int("Build number must be an integer")
    .positive("Minimum build number must be >= 1"),
  note: z.string().trim().max(250).optional(),
  values: z
    .record(z.string(), z.unknown(), {
      message: "Values object is required",
    })
    .refine((val) => validateConfigKeys(val), {
      message: 'Config keys cannot start with "$" or contain "."',
    }),
})

export const updateRemoteConfigSchema = z.object({
  minBuildNumber: z
    .number()
    .int("Build number must be an integer")
    .positive("Minimum build number must be >= 1")
    .optional(),
  note: z.string().trim().max(250).optional(),
  values: z
    .record(z.string(), z.unknown())
    .refine((val) => validateConfigKeys(val), {
      message: 'Config keys cannot start with "$" or contain "."',
    })
    .optional(),
})

export type CreateRemoteConfigInputs = z.infer<typeof createRemoteConfigSchema>
export type UpdateRemoteConfigInputs = z.infer<typeof updateRemoteConfigSchema>
