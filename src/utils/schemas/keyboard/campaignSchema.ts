import { z } from "zod"

/**
 * Embedded media icon reference schema.
 * Represents an asset uploaded via POST /api/v1/admin/media/upload.
 */
export const campaignIconSchema = z.object(
  {
    id: z.string().min(1, "Icon asset ID is required"),
    link: z.url("Icon link must be a valid URL"),
    type: z.string(),
  },
  { message: "Campaign icon is required" }
)

/**
 * Optional platform-specific configuration for Android / iOS.
 */
export const platformCampaignConfigSchema = z.object({
  packageName: z.string().trim().optional(),
  link: z
    .url("Target link must be a valid URL")
    .trim()
    .or(z.literal(""))
    .optional(),
})

/**
 * Validation schema for creating a new campaign.
 */
export const addCampaignSchema = z.object({
  name: z.string().trim().min(1, "Campaign name is required"),
  icon: campaignIconSchema,
  status: z.enum(["active", "paused"]).default("active").optional(),
  android: platformCampaignConfigSchema.optional(),
  ios: platformCampaignConfigSchema.optional(),
  extras: z.record(z.string(), z.unknown()).optional(),
})

/**
 * Validation schema for updating an existing campaign in the admin form.
 */
export const updateCampaignSchema = z.object({
  name: z.string().trim().min(1, "Campaign name is required"),
  icon: campaignIconSchema,
  status: z.enum(["active", "paused"]).optional(),
  android: platformCampaignConfigSchema.optional().nullable(),
  ios: platformCampaignConfigSchema.optional().nullable(),
  extras: z.record(z.string(), z.unknown()).optional().nullable(),
})

export type CampaignIcon = z.infer<typeof campaignIconSchema>
export type MediaRef = CampaignIcon
export type PlatformCampaignConfig = z.infer<typeof platformCampaignConfigSchema>
export type AddCampaignInputs = z.infer<typeof addCampaignSchema>
export type UpdateCampaignInputs = z.infer<typeof updateCampaignSchema>
export type UpdateCampaignFormInputs = UpdateCampaignInputs
export type CreateCampaignPayload = AddCampaignInputs

export interface PatchCampaignPayload {
  name?: string
  icon?: MediaRef
  status?: "active" | "paused"
  android?: PlatformCampaignConfig | null
  ios?: PlatformCampaignConfig | null
  extras?: Record<string, unknown> | null
}

/**
 * Campaign data model returned from backend endpoints.
 */
export interface Campaign {
  _id: string
  id?: string
  name: string
  icon: MediaRef
  status: "active" | "paused"
  android?: PlatformCampaignConfig | null
  ios?: PlatformCampaignConfig | null
  extras?: Record<string, unknown> | null
  createdAt: string
  updatedAt: string
}

