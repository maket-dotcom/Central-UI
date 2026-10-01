import type { ApiEndpoint } from "./types"

export const centralApiConfig: ApiEndpoint[] = [
  { name: "getApps", path: "/api/v1/app-info/get" },
  {
    name: "getAppById",
    path: "/api/v1/app-info/get/{id}",
    hasPathParams: true,
  },
  { name: "addApp", path: "/api/v1/app-info/add" },
  {
    name: "updateApp",
    path: "/api/v1/app-info/update/{id}",
    hasPathParams: true,
  },
  {
    name: "deleteApp",
    path: "/api/v1/app-info/delete/{id}",
    hasPathParams: true,
  },
]
