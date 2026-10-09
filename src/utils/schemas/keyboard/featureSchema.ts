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
    android: z
      .number()
      .int()
      .positive("Android build number must be positive")
      .optional(),
    ios: z
      .number()
      .int()
      .positive("iOS build number must be positive")
      .optional(),
  })
  .optional()

export const createFeatureSchema = z.object({
  key: z
    .string()
    .trim()
    .min(1, "Feature key is required")
    .regex(
      /^[a-z0-9_-]+$/,
      "Key must contain lowercase letters, numbers, hyphens, or underscores"
    ),
  description: z.string().trim().optional(),
  enabled: z.boolean(),
  platforms: z.array(featurePlatformEnum).optional(),
  channels: z.array(featureChannelEnum).optional(),
  minBuildNumber: buildThresholdSchema,
  maxBuildNumber: buildThresholdSchema,
  rolloutPercentage: z.number().int().min(0).max(100),
  allowDevices: z
    .array(z.string().trim().min(1))
    .max(50, "Max 50 devices allowed")
    .optional(),
  denyDevices: z
    .array(z.string().trim().min(1))
    .max(50, "Max 50 devices allowed")
    .optional(),
  payload: z.record(z.string(), z.unknown()).optional(),
})

export const patchFeatureSchema = createFeatureSchema
  .omit({ key: true })
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided for update",
  })

export type CreateFeatureInputs = z.infer<typeof createFeatureSchema>
export type PatchFeatureInputs = z.infer<typeof patchFeatureSchema>
