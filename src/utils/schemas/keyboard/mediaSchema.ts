import { z } from "zod"

const MAX_FILE_SIZE = 2 * 1024 * 1024 // 2MB
const ACCEPTED_IMAGE_TYPES = [
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
  "image/gif",
]

/**
 * Validation schema for uploading media files for the Keyboard app.
 * Enforces genuine binary images (PNG, JPEG, WebP, GIF) and max 2MB limit.
 */
export const addMediaSchema = z.object({
  name: z.string().optional(),
  type: z.string().min(1, "type is required"),
  parentId: z.string().max(64).optional(),
  image: z
    .instanceof(File)
    .refine((file) => file.size > 0, "Image file is required")
    .refine(
      (file) => file.size <= MAX_FILE_SIZE,
      "File exceeds size limit (Max 2MB)"
    )
    .refine(
      (file) => ACCEPTED_IMAGE_TYPES.includes(file.type),
      "file must be a PNG, JPEG, WebP or GIF image"
    ),
})

/**
 * Validation schema for deleting a single media file by ID.
 */
export const deleteMediaByIdSchema = z.object({
  id: z.string().min(1, "id is required"),
})

/**
 * Validation schema for bulk deleting media files.
 */
export const deleteManyMediaSchema = z.object({
  ids: z
    .array(z.string().min(1, "id cannot be empty"))
    .min(1, "At least one id is required"),
})

export type AddMediaInputs = z.infer<typeof addMediaSchema>
export type DeleteMediaById = z.infer<typeof deleteMediaByIdSchema>
export type DeleteManyMediaInputs = z.infer<typeof deleteManyMediaSchema>
