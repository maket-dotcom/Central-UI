import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { getDeviceAppInventorySummary } from "@/services/keyboard/inventory"
import type { InventorySummaryQueryParams } from "@/utils/schemas/keyboard/inventorySchema"

export const useGetDeviceAppInventorySummary = ({
  params,
  initialized = true,
}: {
  params?: InventorySummaryQueryParams
  initialized?: boolean
} = {}) => {
  return useQuery({
    queryKey: ["deviceAppInventorySummary", params],
    queryFn: () => getDeviceAppInventorySummary({ params }),
    placeholderData: keepPreviousData,
    enabled: initialized,
  })
}
