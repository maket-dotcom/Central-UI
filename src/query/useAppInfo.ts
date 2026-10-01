import { useQuery } from "@tanstack/react-query"
import { getApps } from "@/services/appInfo"

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
  params?: object
  initialized?: boolean
} = {}) => {
  return useQuery({
    // Query key includes params to auto-refetch if filter parameters change
    queryKey: ["apps", params],
    // Fetcher function calling the Central appInfo service
    queryFn: () => getApps(params),
    enabled: initialized,
  })
}
