import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import axios from "axios"
import { toast } from "sonner"
import { getErrorMessage } from "@/utils/getErrorMessage"
import {
  getConfigs,
  getConfig,
  putConfig,
  deleteConfig,
  getConfigHistory,
  rollbackConfig,
} from "@/services/keyboard/remoteConfig"
import type {
  PutConfigInputs,
  RollbackConfigInputs,
} from "@/utils/schemas/keyboard/remoteConfigSchema"

export const useGetConfigs = ({
  initialized = true,
}: { initialized?: boolean } = {}) => {
  return useQuery({
    queryKey: ["remoteConfigs"],
    queryFn: () => getConfigs(),
    enabled: initialized,
  })
}

export const useGetConfig = ({
  namespace,
  platform,
}: {
  namespace: string
  platform: string
}) => {
  return useQuery({
    queryKey: ["remoteConfig", namespace, platform],
    queryFn: () => getConfig({ namespace, platform }),
    enabled: !!namespace && !!platform,
  })
}

export const usePutConfig = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: {
      namespace: string
      platform: string
      body: Omit<PutConfigInputs, "namespace" | "platform">
    }) => putConfig(payload),
    onSuccess: (_data, payload) => {
      toast.success("Configuration published successfully")
      queryClient.invalidateQueries({ queryKey: ["remoteConfigs"] })
      queryClient.invalidateQueries({
        queryKey: ["remoteConfig", payload.namespace, payload.platform],
      })
      queryClient.invalidateQueries({
        queryKey: ["remoteConfigHistory", payload.namespace, payload.platform],
      })
    },
    onError: (error: unknown) => {
      if (axios.isAxiosError(error) && error.response?.status === 409) {
        toast.error(
          "Version conflict: Config was modified by another admin. Please refresh and review."
        )
      } else {
        toast.error(getErrorMessage(error))
      }
    },
  })
}

export const useDeleteConfig = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: { namespace: string; platform: string }) =>
      deleteConfig(payload),
    onSuccess: () => {
      toast.success("Configuration document deleted successfully")
      queryClient.invalidateQueries({ queryKey: ["remoteConfigs"] })
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error))
    },
  })
}

export const useGetConfigHistory = ({
  namespace,
  platform,
  limit = 50,
}: {
  namespace: string
  platform: string
  limit?: number
}) => {
  return useQuery({
    queryKey: ["remoteConfigHistory", namespace, platform, limit],
    queryFn: () => getConfigHistory({ namespace, platform, params: { limit } }),
    enabled: !!namespace && !!platform,
  })
}

export const useRollbackConfig = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: {
      namespace: string
      platform: string
      body: RollbackConfigInputs
    }) => rollbackConfig(payload),
    onSuccess: (_data, payload) => {
      toast.success(
        `Successfully rolled back to version ${payload.body.version}`
      )
      queryClient.invalidateQueries({ queryKey: ["remoteConfigs"] })
      queryClient.invalidateQueries({
        queryKey: ["remoteConfig", payload.namespace, payload.platform],
      })
      queryClient.invalidateQueries({
        queryKey: ["remoteConfigHistory", payload.namespace, payload.platform],
      })
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error))
    },
  })
}
