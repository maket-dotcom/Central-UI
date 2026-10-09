import { createApiClient } from "@/api/apiClient"
import { keyboardApiConfig } from "@/api/config/keyboardApiConfig"
import appInstance from "@/api/appInstance"
import type {
  CreateFeatureInputs,
  PatchFeatureInputs,
} from "@/utils/schemas/keyboard/featureSchema"

const api = createApiClient(keyboardApiConfig, appInstance)

export const getFeatures = async () => {
  const { data } = await api.get("getFeatures")
  return data
}

export const getFeatureByKey = async ({ key }: { key: string }) => {
  const { data } = await api.get("getFeatureByKey", undefined, undefined, {
    key,
  })
  return data
}

export const createFeature = async ({
  body,
}: {
  body: CreateFeatureInputs
}) => {
  const { data } = await api.post("createFeature", body)
  return data
}

export const patchFeature = async ({
  key,
  body,
}: {
  key: string
  body: PatchFeatureInputs
}) => {
  const { data } = await api.patch("patchFeature", body, undefined, { key })
  return data
}

export const deleteFeature = async ({ key }: { key: string }) => {
  const { data } = await api.del("deleteFeature", undefined, { key })
  return data
}
