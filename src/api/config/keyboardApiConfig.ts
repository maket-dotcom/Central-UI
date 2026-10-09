import type { ApiEndpoint } from "./types"

export const keyboardApiConfig: ApiEndpoint[] = [
  // Keyboard app's own endpoints (will be populated as we build features)
  // e.g.: { name: "getThemes", path: "/api/v1/theme" },

  // Media endpoints
  { name: "uploadMedia", path: "/api/v1/admin/media/upload" },
  { name: "getAllMedias", path: "/api/v1/admin/media/list" },
  { name: "getMediaById", path: "/api/v1/admin/media/{id}", hasPathParams: true },
  { name: "deleteMediaById", path: "/api/v1/admin/media/{id}", hasPathParams: true },
  { name: "deleteManyMedia", path: "/api/v1/admin/media/delete-many" },

  // Campaign endpoints
  { name: "getCampaigns", path: "/api/v1/admin/campaigns/list" },
  { name: "createCampaign", path: "/api/v1/admin/campaigns" },
  { name: "getCampaignById", path: "/api/v1/admin/campaigns/{id}", hasPathParams: true },
  { name: "updateCampaignById", path: "/api/v1/admin/campaigns/{id}", hasPathParams: true },
  { name: "deleteCampaignById", path: "/api/v1/admin/campaigns/{id}", hasPathParams: true },
]
