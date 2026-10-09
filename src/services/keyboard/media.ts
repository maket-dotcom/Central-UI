import { createApiClient } from "@/api/apiClient"
import { keyboardApiConfig } from "@/api/config/keyboardApiConfig"
import appInstance from "@/api/appInstance"
import type {
  AddMediaInputs,
  DeleteMediaById,
  DeleteManyMediaInputs,
} from "@/utils/schemas/keyboard/mediaSchema"
import type { MediaResponse } from "@/configurations/types"

// Initialize API client configured with Keyboard endpoints and appInstance
const api = createApiClient(keyboardApiConfig, appInstance)

/**
 * Service function to upload media asset to Keyboard backend.
 * Uses POST /api/v1/admin/media/upload with multipart/form-data.
 */
export const addMedia = async (
  payload: AddMediaInputs
): Promise<MediaResponse> => {
  const formData = new FormData()
  if (payload.name) {
    formData.append("name", payload.name)
  } else if (payload.image?.name) {
    formData.append("name", payload.image.name)
  }
  formData.append("type", payload.type)
  if (payload.parentId) formData.append("parentId", payload.parentId)
  formData.append("file", payload.image)

  const { data } = await api.post("uploadMedia", formData, {
    "Content-Type": "multipart/form-data",
  })

  return data as MediaResponse
}

/**
 * Service function to delete a media file by ID from Keyboard backend.
 * Uses DELETE /api/v1/admin/media/:id.
 */
export const deleteMediaById = async (payload: DeleteMediaById) => {
  const { data } = await api.del("deleteMediaById", undefined, {
    id: payload.id,
  })
  return data
}

/**
 * Service function to delete multiple media files by ID from Keyboard backend.
 * Uses POST /api/v1/admin/media/delete-many.
 */
export const deleteManyMedia = async (payload: DeleteManyMediaInputs) => {
  const { data } = await api.post("deleteManyMedia", { ids: payload.ids })
  return data
}

/**
 * Service function to fetch a single media file by ID from Keyboard backend.
 * Uses GET /api/v1/admin/media/:id.
 */
export const getMediaById = async (id: string) => {
  const { data } = await api.get("getMediaById", undefined, undefined, { id })
  return data
}

/**
 * Service function to fetch uploaded media files with optional filtering and pagination.
 * Uses GET /api/v1/admin/media/list.
 */
export const getAllMedias = async (params?: Record<string, unknown>) => {
  const { data } = await api.get("getAllMedias", params)
  return data
}
