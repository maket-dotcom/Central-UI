import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { getErrorMessage } from "@/utils/getErrorMessage"
import {
  getReleases,
  getReleaseById,
  createRelease,
  patchRelease,
  deleteRelease,
} from "@/services/keyboard/release"
import type {
  CreateReleaseInputs,
  PatchReleaseInputs,
} from "@/utils/schemas/keyboard/releaseSchema"

export const useGetReleases = ({
  params,
  initialized = true,
}: {
  params?: { platform?: string; channel?: string; status?: string }
  initialized?: boolean
} = {}) => {
  return useQuery({
    queryKey: ["releases", params],
    queryFn: () => getReleases({ params }),
    enabled: initialized,
  })
}

export const useGetReleaseById = (id: string) => {
  return useQuery({
    queryKey: ["releaseById", id],
    queryFn: () => getReleaseById({ id }),
    enabled: !!id,
  })
}

export const useCreateRelease = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: { body: CreateReleaseInputs }) =>
      createRelease(payload),
    onSuccess: () => {
      toast.success("Release build created successfully")
      queryClient.invalidateQueries({ queryKey: ["releases"] })
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error))
    },
  })
}

export const useUpdateRelease = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: { id: string; body: PatchReleaseInputs }) =>
      patchRelease(payload),
    onSuccess: (_data, payload) => {
      toast.success("Release build updated successfully")
      queryClient.invalidateQueries({ queryKey: ["releases"] })
      queryClient.invalidateQueries({ queryKey: ["releaseById", payload.id] })
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error))
    },
  })
}

export const useDeleteRelease = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: { id: string }) => deleteRelease(payload),
    onSuccess: () => {
      toast.success("Release build deleted successfully")
      queryClient.invalidateQueries({ queryKey: ["releases"] })
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error))
    },
  })
}
