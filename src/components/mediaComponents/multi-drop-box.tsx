import { useEffect, useRef, useState } from "react";
import MediaUpload from "./media-upload";
import Loader from "@/components/loader";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { MediaType } from "@/configurations/types";
import { useDeleteMediaById } from "@/query/useMedia";

interface Item {
  id: string;
  file?: File;
  previewUrl: string;
  resp: any | null;
  isUploading: boolean;
  w?: number;
  h?: number;
}

interface MultiDropBoxProps {
  type: MediaType;
  setMediaResp: (resp: any[]) => void;
  previousMediaLinks?: {
    id: string;
    link: string;
    type: string;
  }[];
  errorTooltip?: string;
  aspectRatioText?: string;
}

/**
 * Multi-file drag-and-drop upload zone supporting concurrent uploads, image previews, and individual removals.
 */
const MultiDropBox = ({
  type,
  setMediaResp,
  previousMediaLinks = [],
  errorTooltip = "",
  aspectRatioText,
}: MultiDropBoxProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [items, setItems] = useState<Item[]>([]);
  const { mutate: deleteMediaMutate } = useDeleteMediaById();

  // Load existing media on initial mount
  useEffect(() => {
    if (!previousMediaLinks.length) return;

    const initialItems: Item[] = previousMediaLinks.map((m) => ({
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
    }));

    setItems(initialItems);
    setMediaResp(initialItems.map((i) => i.resp));
  }, []);

  // Handle file selection from file input
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    files.forEach((file) => {
      const previewUrl = URL.createObjectURL(file);
      const img = new Image();
      img.src = previewUrl;
      img.onload = () => {
        const item: Item = {
          id: crypto.randomUUID(),
          file,
          previewUrl,
          resp: null,
          isUploading: true,
          w: img.naturalWidth,
          h: img.naturalHeight,
        };
        setItems((prev) => [...prev, item]);
      };
      img.onerror = () => {
        const item: Item = {
          id: crypto.randomUUID(),
          file,
          previewUrl,
          resp: null,
          isUploading: true,
          w: 0,
          h: 0,
        };
        setItems((prev) => [...prev, item]);
      };
    });

    e.target.value = "";
  };

  // Callback when an individual item's upload completes
  const handleUploadResp = (id: string, resp: any) => {
    setItems((prev) => {
      const updated = prev.map((i) => {
        if (i.id === id) {
          if (resp && resp.data) {
            resp.data.w = i.w || 0;
            resp.data.h = i.h || 0;
          }
          return { ...i, resp, isUploading: false };
        }
        return i;
      });

      setMediaResp(updated.map((i) => i.resp).filter(Boolean));
      return updated;
    });
  };

  // Remove an item from list and invoke delete mutation if persisted
  const handleRemove = (id: string) => {
    const itemToRemove = items.find((i) => i.id === id);
    const backendId = itemToRemove?.resp?.data?._id || itemToRemove?.resp?.data?.id;
    if (backendId && itemToRemove.file) {
      deleteMediaMutate({ id: backendId });
    }

    setItems((prev) => {
      const updated = prev.filter((i) => i.id !== id);
      setMediaResp(updated.map((i) => i.resp).filter(Boolean));
      return updated;
    });
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Drop area */}
      <div
        onClick={() => fileInputRef.current?.click()}
        className={cn(
          "h-28 w-full border-2 border-dashed rounded-xl flex items-center justify-center cursor-pointer transition-colors bg-background/30 hover:bg-background/50",
          errorTooltip && "border-destructive"
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
        <div className="flex flex-col items-center justify-center gap-1 text-center px-6">
          <p className="text-muted-foreground">Click or drag images to upload</p>
          {aspectRatioText && (
            <p className="text-xs font-semibold text-primary/80">
              Recommended Ratio: {aspectRatioText}
            </p>
          )}
        </div>
      </div>

      {/* Uploaded items grid */}
      <div className="flex flex-col gap-3 max-h-64 overflow-y-auto">
        {items.map((item) => (
          <div
            key={item.id}
            className={cn(
              "relative flex gap-4 p-2 border rounded-xl bg-card",
              item.isUploading && "opacity-70"
            )}
          >
            <div className="w-24 h-24 overflow-hidden rounded-lg border shrink-0">
              <img
                src={item.previewUrl}
                alt="Upload preview"
                className="w-full h-full object-cover"
              />
              {item.isUploading && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/80">
                  <Loader />
                </div>
              )}
            </div>

            <button
              type="button"
              aria-label="Remove image"
              disabled={item.isUploading}
              onClick={() => handleRemove(item.id)}
              className={cn(
                "absolute top-3 right-3 p-1.5 rounded-full bg-background/90 text-muted-foreground cursor-pointer",
                "hover:bg-destructive/20 hover:text-destructive transition-colors duration-200",
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
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MultiDropBox;
