import { useRef, useState, useEffect } from "react"
import Loader from "@/components/loader"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"
import type { MediaType, MediaResponse } from "@/configurations/types"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { getErrorMessage } from "@/utils/getErrorMessage"
import { toast } from "sonner"

export interface UploadMediaPayload {
  image: File
  name: string
  type: string
  parentId?: string
}

export interface SingleDropBoxProps {
  id?: string
  setMediaResp: (resp: MediaResponse | null) => void
  previousMediaId?: string
  previousMediaLink?: string | null
  previousMediaName?: string
  type: MediaType
  errorTooltip?: string
  tooltip?: string
  className?: string
  aspectRatioText?: string
  onError?: (error: unknown, errorMessage: string) => void
  onRemove?: () => void
  /** Mutation function to trigger file upload */
  uploadMutate: (
    payload: UploadMediaPayload,
    options?: {
      onSuccess?: (resp: MediaResponse) => void
      onError?: (err: unknown) => void
    }
  ) => void
  /** Optional mutation function to clean up / delete uploaded media by ID */
  deleteMutate?: (
    payload: { id: string },
    options?: {
      onSuccess?: (resp: unknown) => void
      onError?: (err: unknown) => void
    }
  ) => void
  /** Optional validation function to check file validity prior to upload */
  validateFile?: (file: File) => { success: boolean; error?: string }
}

/**
 * Pure single file drag-and-drop upload zone with preview, dimension detection, and removal support.
 * Decoupled from app-specific backend logic through injected upload and delete mutation props.
 */
const SingleDropBox = ({
  id,
  setMediaResp,
  previousMediaLink = null,
  previousMediaName = "",
  type,
  errorTooltip = "",
  tooltip = "",
  className = "",
  aspectRatioText,
  onError,
  onRemove,
  uploadMutate,
  deleteMutate,
  validateFile,
}: SingleDropBoxProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(previousMediaLink)
  const [isUploading, setIsUploading] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [dimensions, setDimensions] = useState<{ w: number; h: number } | null>(
    null
  )

  // Track the ID of the file uploaded during this session for cleanup on replacement/removal
  const uploadedMediaIdRef = useRef<string | null>(null)

  const setMediaRespRef = useRef(setMediaResp)
  useEffect(() => {
    setMediaRespRef.current = setMediaResp
  }, [setMediaResp])

  const onErrorRef = useRef(onError)
  useEffect(() => {
    onErrorRef.current = onError
  }, [onError])

  const onRemoveRef = useRef(onRemove)
  useEffect(() => {
    onRemoveRef.current = onRemove
  }, [onRemove])

  const [prevMediaLink, setPrevMediaLink] = useState(previousMediaLink)
  if (previousMediaLink !== prevMediaLink) {
    setPrevMediaLink(previousMediaLink)
    if (!imageFile) {
      setPreviewUrl(previousMediaLink)
      setDimensions(null)
    }
  }

  // Calculate natural dimensions whenever previewUrl changes
  useEffect(() => {
    if (!previewUrl) return
    let isCancelled = false
    const img = new Image()
    img.src = previewUrl
    img.onload = () => {
      if (!isCancelled) {
        setDimensions({ w: img.naturalWidth, h: img.naturalHeight })
      }
    }
    img.onerror = () => {
      if (!isCancelled) {
        setDimensions(null)
      }
    }
    return () => {
      isCancelled = true
    }
  }, [previewUrl])

  // Combine external validation errors (e.g. from react-hook-form) and local upload error
  const effectiveError = errorTooltip || uploadError || ""

  const handleFileSelect = () => {
    setUploadError(null)
    fileInputRef.current?.click()
  }

  const handleUploadFile = (file: File) => {
    setUploadError(null)

    // 1. If an asset was previously uploaded in THIS session, delete it first to prevent duplicates
    if (uploadedMediaIdRef.current && deleteMutate) {
      deleteMutate({ id: uploadedMediaIdRef.current })
      uploadedMediaIdRef.current = null
    }

    // 2. Validate file using injected validation callback if provided
    if (validateFile) {
      const validation = validateFile(file)
      if (!validation.success) {
        const errorMsg = validation.error || "Invalid file"
        setUploadError(errorMsg)
        toast.error(errorMsg)
        if (fileInputRef.current) {
          fileInputRef.current.value = ""
        }
        return
      }
    }

    const payload: UploadMediaPayload = {
      image: file,
      name: file.name,
      type,
    }

    const objectUrl = URL.createObjectURL(file)
    setImageFile(file)
    setPreviewUrl(objectUrl)
    setIsUploading(true)
    setMediaRespRef.current(null)

    uploadMutate(payload, {
      onSuccess: (uploadResp) => {
        setIsUploading(false)
        setUploadError(null)
        const newId =
          uploadResp?.data?.ref?.id ||
          uploadResp?.data?._id ||
          uploadResp?.data?.id
        if (newId) {
          uploadedMediaIdRef.current = newId
        }

        // Calculate natural image dimensions
        const img = new Image()
        img.src = objectUrl
        img.onload = () => {
          if (uploadResp?.data) {
            uploadResp.data.w = img.naturalWidth
            uploadResp.data.h = img.naturalHeight
          }
          setDimensions({ w: img.naturalWidth, h: img.naturalHeight })
          setMediaRespRef.current(uploadResp)
        }
        img.onerror = () => {
          setMediaRespRef.current(uploadResp)
        }
      },
      onError: (err: unknown) => {
        const errorMsg = getErrorMessage(err)
        setIsUploading(false)
        setImageFile(null)
        setPreviewUrl(previousMediaLink)
        setUploadError(errorMsg)
        setMediaRespRef.current(null)
        if (fileInputRef.current) {
          fileInputRef.current.value = ""
        }
        onErrorRef.current?.(err, errorMsg)
      },
    })
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleUploadFile(file)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    setUploadError(null)
    const file = e.dataTransfer.files?.[0]
    if (file) {
      handleUploadFile(file)
    }
  }

  const handleRemove = () => {
    setUploadError(null)
    setDimensions(null)
    // Only delete from backend if it was uploaded in this session
    // (Existing saved assets like previousMediaId shouldn't be deleted until the form is submitted)
    if (uploadedMediaIdRef.current && deleteMutate) {
      deleteMutate({ id: uploadedMediaIdRef.current })
      uploadedMediaIdRef.current = null
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }

    setImageFile(null)
    setPreviewUrl(null)
    setMediaRespRef.current(null)
    setIsUploading(false)
    onRemoveRef.current?.()
  }

  const dropZoneContent = (
    <div className={cn("h-28 w-full min-w-0", className)}>
      {/* Dropzone Area */}
      {!isUploading && !previewUrl && (
        <div
          onClick={handleFileSelect}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === "Enter" && handleFileSelect()}
          className={cn(
            "flex cursor-pointer items-center justify-center rounded-xl border-2 border-dashed transition-all duration-300",
            "h-full w-full bg-background/30 hover:bg-background/50",
            "border-muted-foreground/40 hover:border-primary focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:outline-none",
            "shadow-sm hover:shadow-md",
            isDragging && "border-primary bg-primary/10",
            effectiveError !== "" &&
              "border-destructive bg-destructive/5 hover:border-destructive hover:bg-destructive/10"
          )}
        >
          <input
            id={id}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            aria-label="Upload creative image"
          />
          <div className="flex flex-col items-center justify-center gap-1.5 px-6 text-center">
            {uploadError ? (
              <>
                <p className="line-clamp-2 text-sm font-semibold text-destructive">
                  {uploadError}
                </p>
                <p className="text-xs text-muted-foreground">
                  Click or drag another file to try again
                </p>
              </>
            ) : (
              <p
                className={cn(
                  "text-sm font-medium transition-colors",
                  effectiveError
                    ? "font-semibold text-destructive"
                    : "text-muted-foreground"
                )}
              >
                Click or drag and drop to upload an image
              </p>
            )}

            {/* Supported formats & ratio badges - always shown in all states */}
            <div className="mt-0.5 flex flex-wrap items-center justify-center gap-2">
              {aspectRatioText && (
                <span
                  className={cn(
                    "inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-semibold transition-colors",
                    effectiveError
                      ? "border border-destructive/20 bg-destructive/10 text-destructive"
                      : "bg-primary/10 text-primary"
                  )}
                >
                  Ratio: {aspectRatioText}
                </span>
              )}
              <span
                className={cn(
                  "inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-medium ring-1 transition-colors ring-inset",
                  effectiveError
                    ? "bg-destructive/5 text-destructive/80 ring-destructive/30"
                    : "bg-muted text-muted-foreground ring-border/50"
                )}
              >
                PNG, JPEG, WebP, GIF • Max 2MB
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Preview Area */}
      {(isUploading || previewUrl) && (
        <div className="h-full w-full min-w-0">
          {previewUrl ? (
            <div
              className={cn(
                "relative flex items-center gap-4 rounded-xl border border-border bg-card p-2 shadow-md",
                "h-full w-full min-w-0 transition-all duration-200",
                isUploading && "opacity-70",
                effectiveError !== "" &&
                  "border-destructive bg-destructive/5 ring-1 ring-destructive/40"
              )}
            >
              {/* Image preview */}
              <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg ring-1 ring-border">
                <img
                  src={previewUrl}
                  alt="Creative preview"
                  className="h-full w-full object-cover"
                />
                {isUploading && (
                  <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-background/80">
                    <Loader />
                  </div>
                )}
              </div>

              {/* Filename and details */}
              <div className="min-w-0 flex-1 cursor-default">
                <p className="truncate text-sm font-semibold text-foreground">
                  {imageFile?.name ||
                    previousMediaName ||
                    "no details available"}
                </p>
                {effectiveError ? (
                  <p className="mt-1 truncate text-xs font-semibold text-destructive">
                    {effectiveError}
                  </p>
                ) : (
                  <p className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                    {imageFile?.size && (
                      <span>{(imageFile.size / 1024).toFixed(1)} KB</span>
                    )}
                    {imageFile?.size && dimensions && <span>•</span>}
                    {dimensions && (
                      <span className="font-mono text-[11px] text-muted-foreground/80">
                        {dimensions.w} × {dimensions.h} px
                      </span>
                    )}
                  </p>
                )}
              </div>

              {/* Remove button */}
              <button
                type="button"
                aria-label="Remove uploaded image"
                disabled={isUploading}
                onClick={handleRemove}
                className={cn(
                  "absolute top-3 right-3 cursor-pointer rounded-full bg-background/90 p-1.5 text-muted-foreground",
                  "transition-colors duration-200 hover:bg-destructive/20 hover:text-destructive",
                  isUploading && "cursor-not-allowed opacity-50"
                )}
              >
                <X size={18} />
              </button>
            </div>
          ) : (
            <div className="rounded-xl border border-border bg-card p-5 text-center text-sm text-muted-foreground shadow-sm">
              No preview available
            </div>
          )}
        </div>
      )}
    </div>
  )

  if (!effectiveError && !tooltip) {
    return dropZoneContent
  }

  return (
    <Tooltip>
      <TooltipTrigger render={dropZoneContent} />
      <TooltipContent
        className={
          effectiveError
            ? "text-destructive-foreground bg-destructive font-semibold"
            : ""
        }
      >
        <p>{effectiveError || tooltip}</p>
      </TooltipContent>
    </Tooltip>
  )
}

export default SingleDropBox
