import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { getErrorMessage } from "@/utils/getErrorMessage"
import {
  getApps,
  getAppById,
  addApp,
  updateApp,
  deleteApp,
} from "@/services/appInfo"

/**
 * React Query hook for fetching the list of applications from Central-Backend.
 *
 * Usage:
 * - App Selection page (/apps): `useGetApps()` — auto-fetches on mount (initialized defaults to true).
 * - Login page (/login): `useGetApps({ initialized: false })` — disabled on mount,
 *   triggered manually via `refetch()` after the user submits a token.
 *
 * @param params - Optional query filter parameters
 * @param initialized - Whether the query should auto-fire on mount (default: true)
 * @returns React Query result object (data, isLoading, isError, error, refetch, isFetching)
 */
export const useGetApps = ({
  params,
  initialized = true,
}: {
  params?: Record<string, unknown>
  initialized?: boolean
} = {}) => {
  return useQuery({
    // Query key includes params to auto-refetch if filter parameters change
    queryKey: ["apps", params],
    // Fetcher function calling the Central appInfo service
    queryFn: () => getApps({ params }),
    enabled: initialized,
  })
}

export const useGetAppById = (id: string) => {
  return useQuery({
    queryKey: ["appById", id],
    queryFn: () => getAppById({ id }),
    enabled: !!id,
  })
}

export const useAddApp = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: { body: Record<string, unknown> }) => addApp(payload),
    onSuccess: () => {
      toast.success("App created successfully")
      queryClient.invalidateQueries({ queryKey: ["apps"] })
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error))
    },
  })
}

export const useUpdateApp = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: { id: string; body: Record<string, unknown> }) =>
      updateApp(payload),
    onSuccess: (_data, payload) => {
      toast.success("App updated successfully")
      queryClient.invalidateQueries({ queryKey: ["apps"] })
      queryClient.invalidateQueries({
        queryKey: ["appById", payload.id],
      })
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error))
    },
  })
}

export const useDeleteApp = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: { id: string }) => deleteApp(payload),
    onSuccess: () => {
      toast.success("App deleted successfully")
      queryClient.invalidateQueries({ queryKey: ["apps"] })
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error))
    },
  })
}
