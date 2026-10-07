import { useRef, useState, useEffect } from "react"
import MediaUpload from "./media-upload"
import Loader from "@/components/loader"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"
import { useDeleteMediaById } from "@/query/useMedia"
import type { MediaType, MediaResponse } from "@/configurations/types"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface SingleDropBoxProps {
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
}

/**
 * Single file drag-and-drop upload zone with preview, dimension detection, and removal support.
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
}: SingleDropBoxProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(previousMediaLink)
  const [prevMediaLink, setPrevMediaLink] = useState(previousMediaLink)

  if (previousMediaLink !== prevMediaLink) {
    setPrevMediaLink(previousMediaLink)
    setPreviewUrl(previousMediaLink)
  }

  const [resp, setResp] = useState<MediaResponse | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isDragging, setIsDragging] = useState(false)

  const { mutate } = useDeleteMediaById()

  const handleFileSelect = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      setPreviewUrl(URL.createObjectURL(file))
      setIsUploading(true)
      setResp(null)
      setMediaResp(null)
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
    const file = e.dataTransfer.files?.[0]
    if (file && file.type.startsWith("image/")) {
      setImageFile(file)
      setPreviewUrl(URL.createObjectURL(file))
      setIsUploading(true)
      setResp(null)
      setMediaResp(null)
    }
  }

  const handleRemove = () => {
    const mediaId = resp?.data?._id || resp?.data?.id
    if (mediaId) {
      mutate({ id: mediaId })
    }
    setImageFile(null)
    setPreviewUrl(null)
    setResp(null)
    setMediaResp(null)
    setIsUploading(false)
  }

  const setMediaRespRef = useRef(setMediaResp)
  useEffect(() => {
    setMediaRespRef.current = setMediaResp
  }, [setMediaResp])

  useEffect(() => {
    if (resp && resp.data) {
      const currentData = resp.data;
      if (previewUrl) {
        const img = new Image()
        img.src = previewUrl
        img.onload = () => {
          currentData.w = img.naturalWidth
          currentData.h = img.naturalHeight
          setMediaRespRef.current(resp)
        }
        img.onerror = () => {
          currentData.w = 0
          currentData.h = 0
          setMediaRespRef.current(resp)
        }
      } else {
        setMediaRespRef.current(resp)
      }
    } else if (resp) {
      setMediaRespRef.current(resp)
    }
  }, [resp, previewUrl])

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
            errorTooltip !== "" && "border-destructive hover:border-red-400"
          )}
        >
          <input
            id={id}
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            aria-label="Upload creative image"
          />
          <div className="flex flex-col items-center justify-center gap-1 px-6 text-center">
            <p className="text-base font-medium text-muted-foreground">
              Click or drag and drop to upload an image
            </p>
            {aspectRatioText && (
              <p className="text-xs font-semibold text-primary/80">
                Recommended Ratio: {aspectRatioText}
              </p>
            )}
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
                errorTooltip !== "" && "border-destructive"
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
                <p className="mt-1 text-xs text-muted-foreground">
                  {imageFile?.size
                    ? `${(imageFile.size / 1024).toFixed(1)} KB`
                    : ""}
                </p>
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

      {/* Upload trigger */}
      {imageFile && (
        <div className="mt-4 w-full">
          <MediaUpload
            type={type}
            imageFile={imageFile}
            setResp={(r: MediaResponse | null) => {
              setResp(r)
              setIsUploading(false)
            }}
          />
        </div>
      )}
    </div>
  )

  if (!errorTooltip && !tooltip) {
    return dropZoneContent
  }

  return (
    <Tooltip>
      <TooltipTrigger render={dropZoneContent} />
      <TooltipContent
        className={
          errorTooltip
            ? "text-destructive-foreground bg-destructive font-semibold"
            : ""
        }
      >
        <p>{errorTooltip || tooltip}</p>
      </TooltipContent>
    </Tooltip>
  )
}

export default SingleDropBox
