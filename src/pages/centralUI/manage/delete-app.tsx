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
import Loader from "@/components/loader"
import { useDeleteApp } from "@/query/useAppInfo"
import type { AppInfo } from "@/utils/schemas/appInfoSchema"

interface DeleteAppDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  app: AppInfo | null
  onSuccess?: () => void
}

export const DeleteAppDialog: React.FC<DeleteAppDialogProps> = ({
  open,
  onOpenChange,
  app,
  onSuccess,
}) => {
  const deleteMutation = useDeleteApp()

  if (!app) return null

  const handleDelete = () => {
    deleteMutation.mutate(
      { id: app._id },
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
          <DialogTitle>Delete Application</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete{" "}
            <strong className="text-foreground">
              {app.appName}
            </strong>
            ? This will mark the application as deleted in Central-Backend. The
            app will be excluded from active queries and catalog listings.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0">
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
            {deleteMutation.isPending && <Loader />}
            {deleteMutation.isPending ? "Deleting..." : "Delete App"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default DeleteAppDialog
