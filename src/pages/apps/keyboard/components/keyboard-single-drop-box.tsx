import SingleDropBox, {
  type SingleDropBoxProps,
} from "@/components/mediaComponents/single-drop-box"
import { useAddMedia, useDeleteMediaById } from "@/query/keyboard/useMedia"
import { addMediaSchema } from "@/utils/schemas/keyboard/mediaSchema"

export type KeyboardSingleDropBoxProps = Omit<
  SingleDropBoxProps,
  "uploadMutate" | "deleteMutate" | "validateFile"
>

/**
 * Keyboard app-specific SingleDropBox wrapper.
 * Automatically injects Keyboard backend's upload mutation, delete mutation,
 * and Zod validation rules while keeping pages boilerplate-free.
 */
export default function KeyboardSingleDropBox(
  props: KeyboardSingleDropBoxProps
) {
  const { mutate: uploadMutate } = useAddMedia()
  const { mutate: deleteMutate } = useDeleteMediaById()

  const validateFile = (file: File) => {
    const result = addMediaSchema.safeParse({
      image: file,
      name: file.name,
      type: props.type,
    })
    if (!result.success) {
      return {
        success: false,
        error:
          result.error.issues[0]?.message ||
          "Invalid file format or file exceeds size limit (Max 2MB)",
      }
    }
    return { success: true }
  }

  return (
    <SingleDropBox
      uploadMutate={uploadMutate}
      deleteMutate={deleteMutate}
      validateFile={validateFile}
      {...props}
    />
  )
}
