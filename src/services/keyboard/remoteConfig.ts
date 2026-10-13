import { createApiClient } from "@/api/apiClient"
import { keyboardApiConfig } from "@/api/config/keyboardApiConfig"
import appInstance from "@/api/appInstance"
import type {
  CreateRemoteConfigInputs,
  UpdateRemoteConfigInputs,
  ConfigPlatform,
} from "@/utils/schemas/keyboard/remoteConfigSchema"

const api = createApiClient(keyboardApiConfig, appInstance)

export const getRemoteConfigs = async (params?: { platform?: ConfigPlatform }) => {
  const { data } = await api.get("getRemoteConfigs", params)
  return data
}

export const getRemoteConfigById = async (id: string) => {
  const { data } = await api.get("getRemoteConfigById", undefined, undefined, { id })
  return data
}

export const createRemoteConfig = async (body: CreateRemoteConfigInputs) => {
  const { data } = await api.post("createRemoteConfig", body)
  return data
}

export const updateRemoteConfig = async (
  id: string,
  body: UpdateRemoteConfigInputs
) => {
  const { data } = await api.patch("updateRemoteConfig", body, undefined, { id })
  return data
}

export const deleteRemoteConfig = async (id: string) => {
  const { data } = await api.del("deleteRemoteConfig", undefined, { id })
  return data
}
