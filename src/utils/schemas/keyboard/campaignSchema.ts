import { z } from "zod"

/**
 * Validation schema for creating a campaign.
 */
export const addCampaignSchema = z.object({
  name: z.string().min(1, "name is required"),
  iconLink: z
    .string()
    .min(1, "iconLink is required")
    .pipe(z.url("Must be a valid URL")),
  link: z.string().min(1, "link is required").pipe(z.url("Must be a valid URL")),
})

/**
 * Validation schema for updating a campaign.
 */
export const updateCampaignSchema = z.object({
  name: z.string().min(1, "name is required"),
  iconLink: z
    .string()
    .min(1, "iconLink is required")
    .pipe(z.url("Must be a valid URL")),
  link: z.string().min(1, "link is required").pipe(z.url("Must be a valid URL")),
})

export type AddCampaignInputs = z.infer<typeof addCampaignSchema>
export type UpdateCampaignInputs = z.infer<typeof updateCampaignSchema>

export interface Campaign {
  id: string
  name: string
  iconLink: string
  link: string
  extras?: {
    cta?: string
    keywords?: string[]
  }
  created_at: string
  updated_at: string
}
