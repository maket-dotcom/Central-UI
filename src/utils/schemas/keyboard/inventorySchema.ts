import { z } from "zod"

export const inventoryPlatformEnum = z.enum(["android", "ios"])
export type InventoryPlatform = z.infer<typeof inventoryPlatformEnum>

export const inventorySummaryQuerySchema = z.object({
  platform: inventoryPlatformEnum.default("android"),
  page: z.number().int().min(1).max(1000).default(1),
  limit: z.number().int().min(1).max(100).default(25),
})

export type InventorySummaryQueryParams = z.infer<
  typeof inventorySummaryQuerySchema
>

export interface DeviceAppInventoryItem {
  packageName: string
  presentCount: number
  notPresentCount: number
}

export type InventoryDataMapping = Record<string, string>

export interface InventoryPagination {
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface InventorySummaryData {
  dataMapping: InventoryDataMapping
  data: DeviceAppInventoryItem[]
  pagination: InventoryPagination
}

export interface InventorySummaryResponse {
  status: boolean
  message: string
  data: InventorySummaryData
}
