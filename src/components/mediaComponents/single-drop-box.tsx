import { useRef, useState, useEffect } from "react";
import MediaUpload from "./media-upload";
import Loader from "@/components/loader";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDeleteMediaById } from "@/query/useMedia";
import type { MediaType } from "@/configurations/types";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface SingleDropBoxProps {
  id?: string;
  setMediaResp: (resp: any) => void;
  previousMediaId?: string;
  previousMediaLink?: string | null;
  previousMediaName?: string;
  type: MediaType;
  errorTooltip?: string;
  tooltip?: string;
  className?: string;
  aspectRatioText?: string;
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(previousMediaLink);

  useEffect(() => {
    setPreviewUrl(previousMediaLink);
  }, [previousMediaLink]);

  const [resp, setResp] = useState<any>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const { mutate } = useDeleteMediaById();

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setIsUploading(true);
      setResp(null);
      setMediaResp(null);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setIsUploading(true);
      setResp(null);
      setMediaResp(null);
    }
  };

  const handleRemove = () => {
    const mediaId = resp?.data?._id || resp?.data?.id;
    if (mediaId) {
      mutate({ id: mediaId });
    }
    setImageFile(null);
    setPreviewUrl(null);
    setResp(null);
    setMediaResp(null);
    setIsUploading(false);
  };

  const setMediaRespRef = useRef(setMediaResp);
  useEffect(() => {
    setMediaRespRef.current = setMediaResp;
  }, [setMediaResp]);

  useEffect(() => {
    if (resp && resp.data) {
      setIsUploading(false);
      if (previewUrl) {
        const img = new Image();
        img.src = previewUrl;
        img.onload = () => {
          resp.data.w = img.naturalWidth;
          resp.data.h = img.naturalHeight;
          setMediaRespRef.current(resp);
        };
        img.onerror = () => {
          resp.data.w = 0;
          resp.data.h = 0;
          setMediaRespRef.current(resp);
        };
      } else {
        setMediaRespRef.current(resp);
      }
    } else if (resp) {
      setIsUploading(false);
      setMediaRespRef.current(resp);
    }
  }, [resp, previewUrl]);

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
            "border-2 border-dashed rounded-xl flex items-center justify-center cursor-pointer transition-all duration-300",
            "w-full h-full bg-background/30 hover:bg-background/50",
            "border-muted-foreground/40 hover:border-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
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
          <div className="flex flex-col items-center justify-center gap-1 text-center px-6">
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
        <div className="w-full h-full min-w-0">
          {previewUrl ? (
            <div
              className={cn(
                "relative flex items-center gap-4 p-2 bg-card rounded-xl shadow-md border border-border",
                "transition-all duration-200 h-full w-full min-w-0",
                isUploading && "opacity-70",
                errorTooltip !== "" && "border-destructive"
              )}
            >
              {/* Image preview */}
              <div className="relative w-24 h-24 shrink-0 rounded-lg overflow-hidden ring-1 ring-border">
                <img
                  src={previewUrl}
                  alt="Creative preview"
                  className="w-full h-full object-cover"
                />
                {isUploading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-background/80 rounded-lg">
                    <Loader />
                  </div>
                )}
              </div>

              {/* Filename and details */}
              <div className="flex-1 min-w-0 cursor-default">
                <p className="text-sm font-semibold text-foreground truncate">
                  {imageFile?.name ||
                    previousMediaName ||
                    "no details available"}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
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
                  "absolute top-3 right-3 p-1.5 rounded-full bg-background/90 text-muted-foreground cursor-pointer",
                  "hover:bg-destructive/20 hover:text-destructive transition-colors duration-200",
                  isUploading && "cursor-not-allowed opacity-50"
                )}
              >
                <X size={18} />
              </button>
            </div>
          ) : (
            <div className="text-sm text-muted-foreground text-center p-5 bg-card rounded-xl shadow-sm border border-border">
              No preview available
            </div>
          )}
        </div>
      )}

      {/* Upload trigger */}
      {imageFile && (
        <div className="w-full mt-4">
          <MediaUpload
            type={type}
            imageFile={imageFile}
            setResp={setResp}
          />
        </div>
      )}
    </div>
  );

  if (!errorTooltip && !tooltip) {
    return dropZoneContent;
  }

  return (
    <Tooltip>
      <TooltipTrigger render={dropZoneContent} />
      <TooltipContent
        className={errorTooltip ? "bg-destructive font-semibold text-destructive-foreground" : ""}
      >
        <p>{errorTooltip || tooltip}</p>
      </TooltipContent>
    </Tooltip>
  );
};

export default SingleDropBox;
