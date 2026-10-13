import React from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useDeleteRemoteConfig } from "@/query/keyboard/useRemoteConfig"
import type { RemoteConfigDoc } from "@/utils/schemas/keyboard/remoteConfigSchema"

interface DeleteConfigDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  config: RemoteConfigDoc | null
}

export const DeleteConfigDialog: React.FC<DeleteConfigDialogProps> = ({
  open,
  onOpenChange,
  config,
}) => {
  const deleteMutation = useDeleteRemoteConfig()

  if (!config) return null

  const handleDelete = () => {
    deleteMutation.mutate(config._id, {
      onSuccess: () => onOpenChange(false),
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Delete Remote Configuration</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete the configuration document for{" "}
            <strong className="capitalize">{config.platform}</strong> (Build #{config.minBuildNumber}+)
            {config.note ? ` — "${config.note}"` : ""}?
            Devices running this build number will fall back to the next lower version tier.
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
            {deleteMutation.isPending ? "Deleting..." : "Delete Configuration"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default DeleteConfigDialog
