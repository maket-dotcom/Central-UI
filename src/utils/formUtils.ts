import type { FieldErrors } from "react-hook-form"

/**
 * Recursively extracts the first human-readable validation error message
 * from React Hook Form's FieldErrors tree.
 * Handles nested objects (e.g. icon.id, android.link, extras).
 *
 * @param errors - FieldErrors object from React Hook Form
 * @returns Clean, user-facing error message string or null
 */
export const getFirstFormErrorMessage = (errors: FieldErrors): string | null => {
  if (!errors || typeof errors !== "object") return null

  for (const key of Object.keys(errors)) {
    const err = errors[key]
    if (!err) continue

    // Direct error object with a message property
    if (typeof err.message === "string" && err.message.trim()) {
      return err.message
    }

    // Nested error object
    if (typeof err === "object") {
      const nestedMsg = getFirstFormErrorMessage(err as FieldErrors)
      if (nestedMsg) return nestedMsg
    }
  }

  return null
}
