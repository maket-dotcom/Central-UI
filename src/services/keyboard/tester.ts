import { createApiClient } from "@/api/apiClient"
import { keyboardApiConfig } from "@/api/config/keyboardApiConfig"
import appInstance from "@/api/appInstance"
import type { UpsertTesterInputs } from "@/utils/schemas/keyboard/testerSchema"

const api = createApiClient(keyboardApiConfig, appInstance)

export const getTesters = async () => {
  const { data } = await api.get("getTesters")
  return data
}

export const upsertTester = async ({
  deviceId,
  body,
}: {
  deviceId: string
  body: Omit<UpsertTesterInputs, "deviceId">
}) => {
  const { data } = await api.put("upsertTester", body, undefined, { deviceId })
  return data
}

export const deleteTester = async ({ deviceId }: { deviceId: string }) => {
  const { data } = await api.del("deleteTester", undefined, { deviceId })
  return data
}
