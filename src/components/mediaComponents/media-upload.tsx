import { useEffect } from "react";
import { useAddMedia } from "@/query/useMedia";
import type { MediaResponse } from "@/configurations/types";
import {
  addMediaSchema,
  type AddMediaInputs,
} from "@/utils/schemas/mediaSchema";

interface MediaUploadProps {
  /** Media categorization type */
  type: string;
  /** Optional parent resource ID */
  parentId?: string;
  /** Image or media file to upload */
  imageFile: File;
  /** Callback fired with the upload response data */
  setResp: (resp: MediaResponse) => void;
}

/**
 * Headless media upload worker component that triggers the upload mutation upon receiving a file.
 */
const MediaUpload = ({
  type,
  parentId,
  imageFile,
  setResp,
}: MediaUploadProps) => {
  const { mutate } = useAddMedia();

  useEffect(() => {
    if (!imageFile) return;

    const payload: AddMediaInputs = {
      image: imageFile,
      name: imageFile.name,
      type,
      ...(parentId ? { parentId } : {}),
    };

    // Validate payload against schema before initiating upload
    const parseResult = addMediaSchema.safeParse(payload);
    if (!parseResult.success) {
      console.error("Validation failed:", parseResult.error.format());
      return;
    }

    mutate(payload, {
      onSuccess: (resp) => {
        setResp(resp);
      },
      onError: (err) => {
        console.error("Upload failed:", err);
      },
    });
  }, [imageFile, type, parentId, mutate, setResp]);

  return null; // Headless component (no DOM output)
};

export default MediaUpload;
