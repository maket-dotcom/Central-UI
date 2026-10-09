import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { getErrorMessage } from "@/utils/getErrorMessage"
import {
  getFeatures,
  getFeatureByKey,
  createFeature,
  patchFeature,
  deleteFeature,
} from "@/services/keyboard/feature"
import type {
  CreateFeatureInputs,
  PatchFeatureInputs,
} from "@/utils/schemas/keyboard/featureSchema"

export const useGetFeatures = ({
  initialized = true,
}: { initialized?: boolean } = {}) => {
  return useQuery({
    queryKey: ["features"],
    queryFn: () => getFeatures(),
    enabled: initialized,
  })
}

export const useGetFeatureByKey = (key: string) => {
  return useQuery({
    queryKey: ["featureByKey", key],
    queryFn: () => getFeatureByKey({ key }),
    enabled: !!key,
  })
}

export const useCreateFeature = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: { body: CreateFeatureInputs }) =>
      createFeature(payload),
    onSuccess: () => {
      toast.success("Feature flag created successfully")
      queryClient.invalidateQueries({ queryKey: ["features"] })
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error))
    },
  })
}

export const useUpdateFeature = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: { key: string; body: PatchFeatureInputs }) =>
      patchFeature(payload),
    onSuccess: (_data, payload) => {
      toast.success("Feature flag updated successfully")
      queryClient.invalidateQueries({ queryKey: ["features"] })
      queryClient.invalidateQueries({ queryKey: ["featureByKey", payload.key] })
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error))
    },
  })
}

export const useDeleteFeature = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: { key: string }) => deleteFeature(payload),
    onSuccess: () => {
      toast.success("Feature flag deleted successfully")
      queryClient.invalidateQueries({ queryKey: ["features"] })
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error))
    },
  })
}
