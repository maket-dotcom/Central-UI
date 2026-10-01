import { z } from "zod"

/**
 * Validation schema for uploading media files.
 */
export const addMediaSchema = z.object({
  name: z.string().min(1, "name is required"),
  type: z.string().min(1, "type is required"),
  parentId: z.string().optional(),
  image: z
    .instanceof(File)
    .refine((file) => file.size > 0, "Image file is required"),
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
