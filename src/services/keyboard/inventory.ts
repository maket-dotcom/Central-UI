import { createApiClient } from "@/api/apiClient"
import { keyboardApiConfig } from "@/api/config/keyboardApiConfig"
import appInstance from "@/api/appInstance"
import type {
  InventorySummaryQueryParams,
  InventorySummaryResponse,
} from "@/utils/schemas/keyboard/inventorySchema"

const api = createApiClient(keyboardApiConfig, appInstance)

export const getDeviceAppInventorySummary = async ({
  params,
}: {
  params?: InventorySummaryQueryParams
} = {}): Promise<InventorySummaryResponse> => {
  const { data } = await api.get(
    "getDeviceAppInventorySummary",
    params as Record<string, unknown>
  )
  return data
}
