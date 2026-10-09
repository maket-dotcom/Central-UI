import type { ApiEndpoint } from "./types"

export const keyboardApiConfig: ApiEndpoint[] = [
  // Keyboard app's own endpoints (will be populated as we build features)
  // e.g.: { name: "getThemes", path: "/api/v1/theme" },

  // Media endpoints
  { name: "uploadMedia", path: "/api/v1/admin/media/upload" },
  { name: "getAllMedias", path: "/api/v1/admin/media/list" },
  {
    name: "getMediaById",
    path: "/api/v1/admin/media/{id}",
    hasPathParams: true,
  },
  {
    name: "deleteMediaById",
    path: "/api/v1/admin/media/{id}",
    hasPathParams: true,
  },
  { name: "deleteManyMedia", path: "/api/v1/admin/media/delete-many" },

  // Campaign endpoints
  { name: "getCampaigns", path: "/api/v1/admin/campaigns/list" },
  { name: "createCampaign", path: "/api/v1/admin/campaigns" },
  {
    name: "getCampaignById",
    path: "/api/v1/admin/campaigns/{id}",
    hasPathParams: true,
  },
  {
    name: "updateCampaignById",
    path: "/api/v1/admin/campaigns/{id}",
    hasPathParams: true,
  },
  {
    name: "deleteCampaignById",
    path: "/api/v1/admin/campaigns/{id}",
    hasPathParams: true,
  },

  // Tester Management endpoints
  { name: "getTesters", path: "/api/v1/admin/testers/list" },
  {
    name: "upsertTester",
    path: "/api/v1/admin/testers/{deviceId}",
    hasPathParams: true,
  },
  {
    name: "deleteTester",
    path: "/api/v1/admin/testers/{deviceId}",
    hasPathParams: true,
  },

  // Remote Config endpoints
  { name: "getConfigs", path: "/api/v1/admin/configs/list" },
  {
    name: "getConfig",
    path: "/api/v1/admin/configs/{namespace}/{platform}",
    hasPathParams: true,
  },
  {
    name: "putConfig",
    path: "/api/v1/admin/configs/{namespace}/{platform}",
    hasPathParams: true,
  },
  {
    name: "deleteConfig",
    path: "/api/v1/admin/configs/{namespace}/{platform}",
    hasPathParams: true,
  },
  {
    name: "getConfigHistory",
    path: "/api/v1/admin/configs/{namespace}/{platform}/history",
    hasPathParams: true,
  },
  {
    name: "rollbackConfig",
    path: "/api/v1/admin/configs/{namespace}/{platform}/rollback",
    hasPathParams: true,
  },

  // Release Management endpoints
  { name: "getReleases", path: "/api/v1/admin/releases/list" },
  { name: "createRelease", path: "/api/v1/admin/releases" },
  {
    name: "getReleaseById",
    path: "/api/v1/admin/releases/{id}",
    hasPathParams: true,
  },
  {
    name: "patchRelease",
    path: "/api/v1/admin/releases/{id}",
    hasPathParams: true,
  },
  {
    name: "deleteRelease",
    path: "/api/v1/admin/releases/{id}",
    hasPathParams: true,
  },

  // Feature Flags endpoints
  { name: "getFeatures", path: "/api/v1/admin/features/list" },
  { name: "createFeature", path: "/api/v1/admin/features" },
  {
    name: "getFeatureByKey",
    path: "/api/v1/admin/features/{key}",
    hasPathParams: true,
  },
  {
    name: "patchFeature",
    path: "/api/v1/admin/features/{key}",
    hasPathParams: true,
  },
  {
    name: "deleteFeature",
    path: "/api/v1/admin/features/{key}",
    hasPathParams: true,
  },
]
