import React from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useDeleteFeature } from "@/query/keyboard/useFeature"
import type { FeatureFlag } from "@/utils/schemas/keyboard/featureSchema"

interface DeleteFeatureProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  feature: FeatureFlag | null
  onSuccess?: () => void
}

export const DeleteFeatureDialog: React.FC<DeleteFeatureProps> = ({
  open,
  onOpenChange,
  feature,
  onSuccess,
}) => {
  const deleteMutation = useDeleteFeature()

  if (!feature) return null

  const handleDelete = () => {
    deleteMutation.mutate(
      { key: feature.key },
      {
        onSuccess: () => {
          onOpenChange(false)
          onSuccess?.()
        },
      }
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Delete Feature Flag</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete feature flag{" "}
            <strong className="font-mono text-foreground">{feature.key}</strong>
            ? All client applications evaluating this key will immediately
            receive default fallback behavior (disabled).
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={deleteMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? "Deleting..." : "Delete Flag"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default DeleteFeatureDialog
