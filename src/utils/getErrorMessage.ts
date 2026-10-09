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
    const responseData = error.response?.data
    if (typeof responseData === "string" && responseData.trim()) {
      return responseData
    }
    if (responseData && typeof responseData === "object") {
      const data = responseData as Record<string, unknown>
      if (typeof data.error === "string" && data.error.trim()) {
        return data.error
      }
      if (typeof data.message === "string" && data.message.trim()) {
        return data.message
      }
      if (Array.isArray(data.errors) && data.errors.length > 0) {
        const first = data.errors[0]
        if (typeof first === "string") return first
        if (
          first &&
          typeof first === "object" &&
          "message" in first &&
          typeof (first as Record<string, unknown>).message === "string"
        ) {
          return (first as Record<string, unknown>).message as string
        }
      }
    }
    return (
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
