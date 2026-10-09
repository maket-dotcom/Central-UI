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
import { useDeleteRelease } from "@/query/keyboard/useRelease"
import type { Release } from "@/utils/schemas/keyboard/releaseSchema"

interface DeleteReleaseProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  release: Release | null
  onSuccess?: () => void
}

export const DeleteReleaseDialog: React.FC<DeleteReleaseProps> = ({
  open,
  onOpenChange,
  release,
  onSuccess,
}) => {
  const deleteMutation = useDeleteRelease()

  if (!release) return null

  const handleDelete = () => {
    deleteMutation.mutate(
      { id: release._id },
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
          <DialogTitle>Delete Release Build</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete the release build for{" "}
            <strong>
              {release.platform.toUpperCase()} v{release.version} (build #
              {release.buildNumber})
            </strong>
            ? This action cannot be undone. Active clients requesting this
            version will no longer be offered this update.
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
            {deleteMutation.isPending ? "Deleting..." : "Delete Release"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default DeleteReleaseDialog
