import { createApiClient } from "@/api/apiClient"
import { centralApiConfig } from "@/api/config/centralApiConfig"
import centralInstance from "@/api/centralInstance"
import type {
  AddAppInputs,
  UpdateAppInputs,
  AppListResponse,
  SingleAppResponse,
} from "@/utils/schemas/appInfoSchema"

// Initialize parameterized API client configured with Central-Backend endpoints and centralInstance
const api = createApiClient(centralApiConfig, centralInstance)

/**
 * Fetch all registered apps from Central-Backend.
 * Endpoint: GET /api/v1/app-info/get
 *
 * @param params - Optional query parameters (e.g. page, limit, appName)
 * @returns Response data containing the list of apps and pagination
 */
export const getApps = async ({
  params,
}: { params?: Record<string, unknown> } = {}): Promise<AppListResponse> => {
  const { data } = await api.get("getApps", params)
  return data
}

/**
 * Fetch a single app's metadata by its unique ID.
 * Endpoint: GET /api/v1/app-info/get/{id}
 *
 * @param id - App document ID
 * @returns Response data containing the app details
 */
export const getAppById = async ({
  id,
}: {
  id: string
}): Promise<SingleAppResponse> => {
  // Pass { id } to resolve path parameter {id} in URL
  const { data } = await api.get("getAppById", undefined, undefined, { id })
  return data
}

/**
 * Register a new app in Central-Backend.
 * Endpoint: POST /api/v1/app-info/add
 *
 * @param body - App payload (appName, backendBaseUrl)
 * @returns Response data for the created app
 */
export const addApp = async ({
  body,
}: {
  body: AddAppInputs
}): Promise<SingleAppResponse> => {
  const { data } = await api.post("addApp", body)
  return data
}

/**
 * Update an existing app by its unique ID.
 * Endpoint: PATCH /api/v1/app-info/update/{id}
 *
 * @param id - App document ID to update
 * @param body - Partial app fields to update
 * @returns Response data for the updated app
 */
export const updateApp = async ({
  id,
  body,
}: {
  id: string
  body: UpdateAppInputs
}): Promise<SingleAppResponse> => {
  // Pass { id } to resolve path parameter {id} in URL
  const { data } = await api.patch("updateApp", body, undefined, { id })
  return data
}

/**
 * Delete an app by its unique ID.
 * Endpoint: DELETE /api/v1/app-info/delete/{id}
 *
 * @param id - App document ID to delete
 * @returns Response data acknowledging deletion
 */
export const deleteApp = async ({
  id,
}: {
  id: string
}): Promise<{ message: string; data: unknown }> => {
  // Pass { id } to resolve path parameter {id} in URL
  const { data } = await api.del("deleteApp", undefined, { id })
  return data
}

import type { MediaResponse } from "@/configurations/types"

/**
 * Upload a media asset (e.g. app logo) to Central-Backend.
 * Endpoint: POST /api/v1/media/upload
 */
export const uploadCentralMedia = async (payload: {
  image: File
  name?: string
  type?: string
  parentId?: string
}): Promise<MediaResponse> => {
  const formData = new FormData()
  if (payload.name) {
    formData.append("name", payload.name)
  } else if (payload.image?.name) {
    formData.append("name", payload.image.name)
  }
  formData.append("type", payload.type || "logo")
  if (payload.parentId) formData.append("parentId", payload.parentId)
  formData.append("file", payload.image)

  const response = await api.post("uploadMedia", formData, {
    "Content-Type": "multipart/form-data",
  })

  const raw = response.data
  // Handle nested response from Central-Backend executor
  const innerData = raw?.data?.data || raw?.data || raw

  return {
    message: raw?.data?.message || raw?.message || "Media uploaded successfully",
    data: {
      _id: innerData?._id || innerData?.id,
      id: innerData?._id || innerData?.id,
      url: innerData?.url || innerData?.link,
      link: innerData?.url || innerData?.link,
      name: innerData?.name,
      type: innerData?.type,
      fileType: innerData?.fileType,
      size: innerData?.size,
    },
  } as MediaResponse
}

