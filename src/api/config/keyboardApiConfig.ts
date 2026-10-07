import type { ApiEndpoint } from "./types"

export const keyboardApiConfig: ApiEndpoint[] = [
  // Keyboard app's own endpoints (will be populated as we build features)
  // e.g.: { name: "getThemes", path: "/api/v1/theme" },

  // campaign apis

  { name: "getCampaigns", path: "/v1/admin/campaigns" },
  { name: "createCampaign", path: "/v1/admin/campaigns" },
  { name: "getCampaignById", path: "/v1/admin/campaigns/{id}", hasPathParams: true },
  { name: "updateCampaignById", path: "/v1/admin/campaigns/{id}", hasPathParams: true },
  { name: "deleteCampaignById", path: "/v1/admin/campaigns/{id}", hasPathParams: true },
]
