import { createApiClient } from "@/api/apiClient"
import { keyboardApiConfig } from "@/api/config/keyboardApiConfig"
import appInstance from "@/api/appInstance"
import type { AddCampaignInputs } from "@/utils/schemas/keyboard/campaignSchema"

// Initialize API client configured with Keyboard endpoints and appInstance
const api = createApiClient(keyboardApiConfig, appInstance)

export const createCampaign = async ({ body }: { body: AddCampaignInputs }) => {
  const { data } = await api.post("createCampaign", body)
  return data
}

export const getCampaigns = async ({
  params,
}: { params?: Record<string, unknown> } = {}) => {
  const { data } = await api.get("getCampaigns", params)
  return data
}

export const getCampaignById = async ({ id }: { id: string }) => {
  const { data } = await api.get("getCampaignById", undefined, undefined, {
    id,
  })
  return data
}

export const updateCampaignById = async ({
  id,
  body,
}: {
  id: string
  body: Record<string, unknown>
}) => {
  const { data } = await api.patch("updateCampaignById", body, undefined, {
    id,
  })
  return data
}

export const deleteCampaignById = async ({ id }: { id: string }) => {
  const { data } = await api.del("deleteCampaignById", undefined, { id })
  return data
}
