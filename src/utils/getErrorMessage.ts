import { AxiosError } from "axios"

/**
 * Extracts a human-readable error message from an unknown catch error.
 * Handles AxiosError payloads (including API backend error responses), standard Error instances,
 * and fallback strings for unexpected exceptions.
 *
 * @param error - The caught error object
 * @returns Clean, user-facing error message string
 */
export const getErrorMessage = (error: unknown): string => {
  // If the error originated from Axios HTTP requests
  if (error instanceof AxiosError) {
    if (
      typeof error.response?.data === "string" &&
      error.response.data.trim()
    ) {
      return error.response.data
    }
    return (
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      "An unexpected error occurred"
    )
  }

  // If standard JavaScript Error
  if (error instanceof Error) {
    return error.message
  }

  // Generic fallback for non-Error thrown objects
  return "An unexpected error occurred"
}
