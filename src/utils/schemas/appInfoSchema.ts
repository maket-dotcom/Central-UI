import { z } from "zod"

/**
 * Shape of an application document returned by Central-Backend.
 */
export interface AppInfo {
  _id: string
  appName: string
  backendBaseUrl: string
  status: "active" | "deleted" | string
  createdBy?: string
  updatedBy?: string
  createdAt: string
  updatedAt: string
  __v?: number
}

/**
 * Server-side pagination metadata for App queries.
 */
export interface AppPagination {
  total: number
  page: number
  limit: number
  totalPages: number
}

/**
 * Body payload of GET /api/v1/app-info/get.
 */
export interface AppListData {
  message: string
  dataMapping?: Record<string, string>
  data: AppInfo[]
  pagination: AppPagination
}

/**
 * Standard GET /api/v1/app-info/get response payload structure.
 */
export interface AppListResponse {
  status: number
  data: AppListData
}

/**
 * Body payload of single app endpoints.
 */
export interface SingleAppData {
  message: string
  data: AppInfo
}

/**
 * Standard single app response payload.
 */
export interface SingleAppResponse {
  status: number
  data: SingleAppData
}


/**
 * Validation schema for registering a new application (POST /api/v1/app-info/add).
 */
export const addAppSchema = z.object({
  appName: z
    .string()
    .trim()
    .min(1, "App name is required")
    .max(100, "App name must not exceed 100 characters"),
  backendBaseUrl: z
    .string()
    .trim()
    .min(1, "Backend base URL is required")
    .refine(
      (val) => /^https?:\/\/.+/i.test(val),
      "Backend base URL must be a valid URI with http or https"
    ),
})

/**
 * Validation schema for updating an existing application (PATCH /api/v1/app-info/update/:id).
 */
export const updateAppSchema = z.object({
  appName: z
    .string()
    .trim()
    .min(1, "App name must be at least 1 character")
    .max(100, "App name must not exceed 100 characters")
    .optional(),
  backendBaseUrl: z
    .string()
    .trim()
    .refine(
      (val) => !val || /^https?:\/\/.+/i.test(val),
      "Backend base URL must be a valid URI with http or https"
    )
    .optional(),
})

export type AddAppInputs = z.infer<typeof addAppSchema>
export type UpdateAppInputs = z.infer<typeof updateAppSchema>
