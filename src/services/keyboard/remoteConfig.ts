import { createApiClient } from "@/api/apiClient"
import { keyboardApiConfig } from "@/api/config/keyboardApiConfig"
import appInstance from "@/api/appInstance"
import type {
  PutConfigInputs,
  RollbackConfigInputs,
} from "@/utils/schemas/keyboard/remoteConfigSchema"

const api = createApiClient(keyboardApiConfig, appInstance)

export const getConfigs = async () => {
  const { data } = await api.get("getConfigs")
  return data
}

export const getConfig = async ({
  namespace,
  platform,
}: {
  namespace: string
  platform: string
}) => {
  const { data } = await api.get("getConfig", undefined, undefined, {
    namespace,
    platform,
  })
  return data
}

export const putConfig = async ({
  namespace,
  platform,
  body,
}: {
  namespace: string
  platform: string
  body: Omit<PutConfigInputs, "namespace" | "platform">
}) => {
  const { data } = await api.put("putConfig", body, undefined, {
    namespace,
    platform,
  })
  return data
}

export const deleteConfig = async ({
  namespace,
  platform,
}: {
  namespace: string
  platform: string
}) => {
  const { data } = await api.del("deleteConfig", undefined, {
    namespace,
    platform,
  })
  return data
}

export const getConfigHistory = async ({
  namespace,
  platform,
  params,
}: {
  namespace: string
  platform: string
  params?: { limit?: number }
}) => {
  const { data } = await api.get("getConfigHistory", params, undefined, {
    namespace,
    platform,
  })
  return data
}

export const rollbackConfig = async ({
  namespace,
  platform,
  body,
}: {
  namespace: string
  platform: string
  body: RollbackConfigInputs
}) => {
  const { data } = await api.post("rollbackConfig", body, undefined, {
    namespace,
    platform,
  })
  return data
}
