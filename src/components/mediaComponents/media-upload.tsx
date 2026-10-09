import { useEffect, useRef } from "react"
import type { MediaResponse } from "@/configurations/types"

export interface MediaUploadPayload {
  image: File
  name: string
  type: string
  parentId?: string
}

interface MediaUploadProps {
  /** Media categorization type */
  type: string
  /** Optional parent resource ID */
  parentId?: string
  /** Image or media file to upload */
  imageFile: File
  /** Callback fired with the upload response data */
  setResp: (resp: MediaResponse) => void
  /** Optional error callback */
  onError?: (error: unknown) => void
  /** Optional upload mutation trigger function */
  uploadMutate?: (
    payload: MediaUploadPayload,
    options?: {
      onSuccess?: (resp: MediaResponse) => void
      onError?: (err: unknown) => void
    }
  ) => void
  /** Optional validation function */
  validateFile?: (file: File) => { success: boolean; error?: string }
}

/**
 * Headless media upload worker component that triggers the upload mutation upon receiving a file.
 * Decoupled from app-specific queries.
 */
const MediaUpload = ({
  type,
  parentId,
  imageFile,
  setResp,
  onError,
  uploadMutate,
  validateFile,
}: MediaUploadProps) => {
  const setRespRef = useRef(setResp)
  const onErrorRef = useRef(onError)
  const uploadedFileRef = useRef<File | null>(null)

  useEffect(() => {
    setRespRef.current = setResp
    onErrorRef.current = onError
  }, [setResp, onError])

  useEffect(() => {
    // Prevent re-uploading the same file instance across renders
    if (!imageFile || uploadedFileRef.current === imageFile) return
    uploadedFileRef.current = imageFile

    // Validate file if validator is supplied
    if (validateFile) {
      const validation = validateFile(imageFile)
      if (!validation.success) {
        uploadedFileRef.current = null
        onErrorRef.current?.(new Error(validation.error || "Invalid file"))
        return
      }
    }

    const payload: MediaUploadPayload = {
      image: imageFile,
      name: imageFile.name,
      type,
      ...(parentId ? { parentId } : {}),
    }

    if (uploadMutate) {
      uploadMutate(payload, {
        onSuccess: (resp) => {
          setRespRef.current(resp)
        },
        onError: (err) => {
          console.error("Upload failed:", err)
          uploadedFileRef.current = null
          onErrorRef.current?.(err)
        },
      })
    }
  }, [imageFile, type, parentId, uploadMutate, validateFile])

  return null // Headless component (no DOM output)
}

export default MediaUpload
