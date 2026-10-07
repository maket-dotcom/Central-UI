import { createApiClient } from "@/api/apiClient"
import { centralApiConfig } from "@/api/config/centralApiConfig"
import centralInstance from "@/api/centralInstance"

// Initialize parameterized API client configured with Central-Backend endpoints and centralInstance
const api = createApiClient(centralApiConfig, centralInstance)

/**
 * Fetch all registered apps from Central-Backend.
 * Endpoint: GET /api/v1/app-info/get
 *
 * @param params - Optional query parameters (e.g. status filter, pagination)
 * @returns Response data containing the list of apps
 */
export const getApps = async ({
  params,
}: { params?: Record<string, unknown> } = {}) => {
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
export const getAppById = async ({ id }: { id: string }) => {
  // Pass { id } to resolve path parameter {id} in URL
  const { data } = await api.get("getAppById", undefined, undefined, { id })
  return data
}

/**
 * Register a new app in Central-Backend.
 * Endpoint: POST /api/v1/app-info/add
 *
 * @param body - App payload (e.g. appName, backendBaseUrl, status)
 * @returns Response data for the created app
 */
export const addApp = async ({ body }: { body: Record<string, unknown> }) => {
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
  body: Record<string, unknown>
}) => {
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
export const deleteApp = async ({ id }: { id: string }) => {
  // Pass { id } to resolve path parameter {id} in URL
  const { data } = await api.del("deleteApp", undefined, { id })
  return data
}
