import SingleDropBox, {
  type SingleDropBoxProps,
} from "@/components/mediaComponents/single-drop-box"
import { useUploadCentralMedia } from "@/query/useAppInfo"

export type CentralSingleDropBoxProps = Omit<
  SingleDropBoxProps,
  "uploadMutate" | "validateFile"
>

/**
 * Central-specific SingleDropBox wrapper for application logos.
 * Automatically injects Central backend upload & delete mutations and file validation.
 */
export default function CentralSingleDropBox(props: CentralSingleDropBoxProps) {
  const { mutate: uploadMutate } = useUploadCentralMedia()

  const validateFile = (file: File) => {
    // 2MB size limit
    if (file.size > 2 * 1024 * 1024) {
      return {
        success: false,
        error: "Image exceeds 2MB limit",
      }
    }

    const validTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp", "image/gif"]
    if (!validTypes.includes(file.type)) {
      return {
        success: false,
        error: "Only PNG, JPEG, WebP, or GIF images are accepted",
      }
    }

    return { success: true }
  }

  return (
    <SingleDropBox
      uploadMutate={uploadMutate}
      validateFile={validateFile}
      {...props}
    />
  )
}
