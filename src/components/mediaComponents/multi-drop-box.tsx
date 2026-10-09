import { useEffect, useRef, useState } from "react"
import MediaUpload from "./media-upload"
import Loader from "@/components/loader"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"
import type { MediaType, MediaResponse } from "@/configurations/types"
import { getErrorMessage } from "@/utils/getErrorMessage"
import type { MediaUploadPayload } from "./media-upload"

interface Item {
  id: string
  file?: File
  previewUrl: string
  resp: MediaResponse | null
  isUploading: boolean
  error?: string
  w?: number
  h?: number
}

interface MultiDropBoxProps {
  type: MediaType
  setMediaResp: (resp: MediaResponse[]) => void
  previousMediaLinks?: {
    id: string
    link: string
    type: string
  }[]
  errorTooltip?: string
  aspectRatioText?: string
  /** Optional mutation function to trigger file upload */
  uploadMutate?: (
    payload: MediaUploadPayload,
    options?: {
      onSuccess?: (resp: MediaResponse) => void
      onError?: (err: unknown) => void
    }
  ) => void
  /** Optional mutation function to clean up / delete media by ID */
  deleteMutate?: (
    payload: { id: string },
    options?: {
      onSuccess?: (resp: unknown) => void
      onError?: (err: unknown) => void
    }
  ) => void
  /** Optional validation function */
  validateFile?: (file: File) => { success: boolean; error?: string }
}

/**
 * Multi-file drag-and-drop upload zone supporting concurrent uploads, image previews, and individual removals.
 * Decoupled from app-specific queries.
 */
const MultiDropBox = ({
  type,
  setMediaResp,
  previousMediaLinks = [],
  errorTooltip = "",
  aspectRatioText,
  uploadMutate,
  deleteMutate,
  validateFile,
}: MultiDropBoxProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [items, setItems] = useState<Item[]>(() => {
    if (!previousMediaLinks || previousMediaLinks.length === 0) return []
    return previousMediaLinks.map((m) => ({
      id: crypto.randomUUID(),
      previewUrl: m.link,
      isUploading: false,
      resp: {
        data: {
          _id: m.id,
          link1: m.link,
          type: m.type,
        },
      },
    }))
  })

  // Load existing media into parent state on initial mount
  useEffect(() => {
    if (items.length > 0) {
      setMediaResp(items.map((i) => i.resp).filter(Boolean) as MediaResponse[])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Handle file selection from file input
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (!files.length) return

    files.forEach((file) => {
      const previewUrl = URL.createObjectURL(file)
      const img = new Image()
      img.src = previewUrl
      img.onload = () => {
        const item: Item = {
          id: crypto.randomUUID(),
          file,
          previewUrl,
          resp: null,
          isUploading: true,
          w: img.naturalWidth,
          h: img.naturalHeight,
        }
        setItems((prev) => [...prev, item])
      }
      img.onerror = () => {
        const item: Item = {
          id: crypto.randomUUID(),
          file,
          previewUrl,
          resp: null,
          isUploading: true,
          w: 0,
          h: 0,
        }
        setItems((prev) => [...prev, item])
      }
    })

    e.target.value = ""
  }

  // Callback when an individual item's upload completes
  const handleUploadResp = (id: string, resp: MediaResponse) => {
    setItems((prev) => {
      const updated = prev.map((i) => {
        if (i.id === id) {
          if (resp && resp.data) {
            resp.data.w = i.w || 0
            resp.data.h = i.h || 0
          }
          return { ...i, resp, isUploading: false, error: undefined }
        }
        return i
      })

      setMediaResp(
        updated.map((i) => i.resp).filter(Boolean) as MediaResponse[]
      )
      return updated
    })
  }

  // Callback when an individual item's upload fails
  const handleUploadError = (id: string, error: unknown) => {
    const errorMsg = getErrorMessage(error)
    setItems((prev) =>
      prev.map((i) =>
        i.id === id ? { ...i, isUploading: false, error: errorMsg } : i
      )
    )
  }

  // Remove an item from list and invoke delete mutation if persisted
  const handleRemove = (id: string) => {
    const itemToRemove = items.find((i) => i.id === id)
    const backendId =
      itemToRemove?.resp?.data?._id || itemToRemove?.resp?.data?.id
    if (backendId && itemToRemove.file && deleteMutate) {
      deleteMutate({ id: backendId })
    }

    setItems((prev) => {
      const updated = prev.filter((i) => i.id !== id)
      setMediaResp(
        updated.map((i) => i.resp).filter(Boolean) as MediaResponse[]
      )
      return updated
    })
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Drop area */}
      <div
        onClick={() => fileInputRef.current?.click()}
        className={cn(
          "flex h-28 w-full cursor-pointer items-center justify-center rounded-xl border-2 border-dashed bg-background/30 transition-colors hover:bg-background/50",
          errorTooltip && "border-destructive bg-destructive/5"
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
          aria-label="Upload multiple images"
        />
        <div className="flex flex-col items-center justify-center gap-1 px-6 text-center">
          <p className="text-muted-foreground">
            Click or drag images to upload
          </p>
          {aspectRatioText && (
            <p className="text-xs font-semibold text-primary/80">
              Recommended Ratio: {aspectRatioText}
            </p>
          )}
        </div>
      </div>

      {/* Uploaded items grid */}
      <div className="flex max-h-64 flex-col gap-3 overflow-y-auto">
        {items.map((item) => (
          <div
            key={item.id}
            className={cn(
              "relative flex gap-4 rounded-xl border bg-card p-2 transition-colors",
              item.isUploading && "opacity-70",
              item.error && "border-destructive bg-destructive/5"
            )}
          >
            <div className="h-24 w-24 shrink-0 overflow-hidden rounded-lg border">
              <img
                src={item.previewUrl}
                alt="Upload preview"
                className="h-full w-full object-cover"
              />
              {item.isUploading && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/80">
                  <Loader />
                </div>
              )}
            </div>

            <div className="min-w-0 flex-1 cursor-default pr-8">
              <p className="truncate text-sm font-semibold text-foreground">
                {item.file?.name || "Uploaded media"}
              </p>
              {item.error ? (
                <p className="mt-1 line-clamp-2 text-xs font-semibold text-destructive">
                  {item.error}
                </p>
              ) : (
                item.file && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    {(item.file.size / 1024).toFixed(1)} KB
                  </p>
                )
              )}
            </div>

            <button
              type="button"
              aria-label="Remove image"
              disabled={item.isUploading}
              onClick={() => handleRemove(item.id)}
              className={cn(
                "absolute top-3 right-3 cursor-pointer rounded-full bg-background/90 p-1.5 text-muted-foreground",
                "transition-colors duration-200 hover:bg-destructive/20 hover:text-destructive",
                item.isUploading && "cursor-not-allowed opacity-50"
              )}
            >
              <X size={18} />
            </button>

            {item.isUploading && item.file && (
              <MediaUpload
                type={type}
                imageFile={item.file}
                setResp={(resp) => handleUploadResp(item.id, resp)}
                onError={(err) => handleUploadError(item.id, err)}
                uploadMutate={uploadMutate}
                validateFile={validateFile}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default MultiDropBox
