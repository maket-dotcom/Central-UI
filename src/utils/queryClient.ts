import { QueryClient } from "@tanstack/react-query"

/**
 * Shared React Query client instance.
 * Configured with baseline cache and refetch behaviors across the entire application.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Avoid unexpected background refetches on tab switch
      refetchOnWindowFocus: false,
      // Retry failed requests once before presenting error state
      retry: 1,
      // Instantly marks data as stale
      staleTime: 0,
    },
  },
})
