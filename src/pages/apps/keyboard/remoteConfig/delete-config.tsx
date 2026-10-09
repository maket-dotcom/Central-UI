import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useDeleteConfig } from "@/query/keyboard/useRemoteConfig"
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
  const deleteMutation = useDeleteConfig()

  if (!config) return null

  const handleDelete = () => {
    deleteMutation.mutate(
      {
        namespace: config.namespace,
        platform: config.platform,
      },
      {
        onSuccess: () => onOpenChange(false),
      }
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Delete Configuration Document</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete the{" "}
            <strong>{config.platform}</strong> configuration for namespace{" "}
            <strong>{config.namespace}</strong>? Clients on this platform will
            fall back to baseline settings or default configurations.
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
