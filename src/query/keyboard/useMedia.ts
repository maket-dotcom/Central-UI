import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { getErrorMessage } from "@/utils/getErrorMessage"
import {
  addMedia,
  deleteManyMedia,
  deleteMediaById,
  getAllMedias,
  getMediaById,
} from "@/services/keyboard/media"
import type {
  AddMediaInputs,
  DeleteMediaById,
  DeleteManyMediaInputs,
} from "@/utils/schemas/keyboard/mediaSchema"

/**
 * Mutation hook for uploading a media asset to Keyboard backend.
 */
export const useAddMedia = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: AddMediaInputs) => addMedia(payload),
    onSuccess: (data) => {
      queryClient.setQueryData(["mediaAdded"], data?.data)
      toast.success("Media uploaded successfully")
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error))
    },
  })
}

/**
 * Mutation hook for deleting a single media asset by ID from Keyboard backend.
 */
export const useDeleteMediaById = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: DeleteMediaById) => deleteMediaById(payload),
    onSuccess: (data) => {
      queryClient.setQueryData(["mediaDeleted"], data?.data)
      toast.success("Media deleted successfully")
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error))
    },
  })
}

/**
 * Mutation hook for deleting multiple media assets from Keyboard backend.
 */
export const useDeleteManyMedia = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: DeleteManyMediaInputs) => deleteManyMedia(payload),
    onSuccess: () => {
      toast.success("Selected media deleted successfully")
      queryClient.invalidateQueries({
        queryKey: ["getAllMedias"],
      })
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error))
    },
  })
}

/**
 * Query hook for retrieving a single media asset by ID from Keyboard backend.
 */
export const useGetMediaById = (id: string) => {
  return useQuery({
    queryKey: ["mediaById", id],
    queryFn: () => getMediaById(id),
    enabled: !!id,
  })
}

/**
 * Query hook for retrieving media assets with optional filter and pagination parameters.
 */
export const useGetAllMedias = (params?: Record<string, unknown>) => {
  return useQuery({
    queryKey: ["getAllMedias", params],
    queryFn: () => getAllMedias(params),
  })
}
