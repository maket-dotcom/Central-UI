import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { getErrorMessage } from "@/utils/getErrorMessage"
import {
  getRemoteConfigs,
  getRemoteConfigById,
  createRemoteConfig,
  updateRemoteConfig,
  deleteRemoteConfig,
} from "@/services/keyboard/remoteConfig"
import type {
  ConfigPlatform,
  CreateRemoteConfigInputs,
  UpdateRemoteConfigInputs,
} from "@/utils/schemas/keyboard/remoteConfigSchema"

export const useGetRemoteConfigs = (params?: { platform?: ConfigPlatform }) => {
  return useQuery({
    queryKey: ["remoteConfigs", params?.platform],
    queryFn: () => getRemoteConfigs(params),
  })
}

export const useGetRemoteConfig = (id?: string) => {
  return useQuery({
    queryKey: ["remoteConfig", id],
    queryFn: () => getRemoteConfigById(id!),
    enabled: !!id,
  })
}

export const useCreateRemoteConfig = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: CreateRemoteConfigInputs) => createRemoteConfig(body),
    onSuccess: () => {
      toast.success("Remote configuration created successfully")
      queryClient.invalidateQueries({ queryKey: ["remoteConfigs"] })
    },
    onError: (err: unknown) => {
      toast.error(getErrorMessage(err))
    },
  })
}

export const useUpdateRemoteConfig = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: { id: string; body: UpdateRemoteConfigInputs }) =>
      updateRemoteConfig(payload.id, payload.body),
    onSuccess: (_data, payload) => {
      toast.success("Remote configuration updated successfully")
      queryClient.invalidateQueries({ queryKey: ["remoteConfigs"] })
      queryClient.invalidateQueries({ queryKey: ["remoteConfig", payload.id] })
    },
    onError: (err: unknown) => {
      toast.error(getErrorMessage(err))
    },
  })
}

export const useDeleteRemoteConfig = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteRemoteConfig(id),
    onSuccess: () => {
      toast.success("Remote configuration deleted successfully")
      queryClient.invalidateQueries({ queryKey: ["remoteConfigs"] })
    },
    onError: (err: unknown) => {
      toast.error(getErrorMessage(err))
    },
  })
}
