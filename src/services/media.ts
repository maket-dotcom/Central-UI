import type {
  AddMediaInputs,
  DeleteMediaById,
  DeleteManyMediaInputs,
} from "@/utils/schemas/mediaSchema"

/**
 * Service function to upload media.
 * Placeholder for future backend integration.
 */
export const addMedia = async (payload: AddMediaInputs) => {
  const formData = new FormData()
  formData.append("name", payload.name)
  formData.append("type", payload.type)
  if (payload.parentId) formData.append("parentId", payload.parentId)
  formData.append("image", payload.image)

  // Return mocked upload response until backend media endpoint is ready
  return {
    data: {
      id: `media-${Date.now()}`,
      name: payload.name,
      type: payload.type,
      link: URL.createObjectURL(payload.image),
    },
  }
}

/**
 * Service function to delete a media file by ID.
 * Placeholder for future backend integration.
 */
export const deleteMediaById = async (payload: DeleteMediaById) => {
  return {
    data: { success: true, id: payload.id },
  }
}

/**
 * Service function to delete multiple media files by ID.
 * Placeholder for future backend integration.
 */
export const deleteManyMedia = async (payload: DeleteManyMediaInputs) => {
  return {
    data: { success: true, ids: payload.ids },
  }
}

/**
 * Service function to fetch all uploaded media files.
 * Placeholder for future backend integration.
 */
export const getAllMedias = async () => {
  return {
    data: [],
  }
}
