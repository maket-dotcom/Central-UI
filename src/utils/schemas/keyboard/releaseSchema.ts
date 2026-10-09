import { z } from "zod"

export const releasePlatformEnum = z.enum(["android", "ios"])
export const releaseChannelEnum = z.enum(["internal", "beta", "production"])
export const releaseStatusEnum = z.enum([
  "draft",
  "active",
  "paused",
  "archived",
])

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
    .regex(
      /^v?\d+(\.\d+)*$/,
      "Must be a valid semver display format (e.g. 1.2.0)"
    ),
  buildNumber: z
    .number()
    .int("Build number must be an integer")
    .positive("Build number must be a positive integer"),
  downloadUrl: z
    .string()
    .trim()
    .min(1, "Download URL is required")
    .pipe(z.url({ message: "Download URL must be a valid URL" })),
  changelog: z.string().trim().optional(),
  minBuildNumber: z
    .number()
    .int()
    .positive("Min build number must be a positive integer")
    .optional(),
  forceUpdate: z.boolean(),
  rolloutPercentage: z.number().int().min(0).max(100),
  status: releaseStatusEnum,
})

export const patchReleaseSchema = createReleaseSchema
  .omit({ platform: true, version: true })
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided for update",
  })

export type CreateReleaseInputs = z.infer<typeof createReleaseSchema>
export type PatchReleaseInputs = z.infer<typeof patchReleaseSchema>
