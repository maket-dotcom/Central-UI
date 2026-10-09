import { createApiClient } from "@/api/apiClient"
import { keyboardApiConfig } from "@/api/config/keyboardApiConfig"
import appInstance from "@/api/appInstance"
import type {
  CreateReleaseInputs,
  PatchReleaseInputs,
} from "@/utils/schemas/keyboard/releaseSchema"

const api = createApiClient(keyboardApiConfig, appInstance)

export const getReleases = async ({
  params,
}: {
  params?: { platform?: string; channel?: string; status?: string }
} = {}) => {
  const { data } = await api.get("getReleases", params)
  return data
}

export const getReleaseById = async ({ id }: { id: string }) => {
  const { data } = await api.get("getReleaseById", undefined, undefined, { id })
  return data
}

export const createRelease = async ({
  body,
}: {
  body: CreateReleaseInputs
}) => {
  const { data } = await api.post("createRelease", body)
  return data
}

export const patchRelease = async ({
  id,
  body,
}: {
  id: string
  body: PatchReleaseInputs
}) => {
  const { data } = await api.patch("patchRelease", body, undefined, { id })
  return data
}

export const deleteRelease = async ({ id }: { id: string }) => {
  const { data } = await api.del("deleteRelease", undefined, { id })
  return data
}
