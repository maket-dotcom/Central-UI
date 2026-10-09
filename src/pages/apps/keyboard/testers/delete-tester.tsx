import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useDeleteTester } from "@/query/keyboard/useTester"
import type { Tester } from "@/utils/schemas/keyboard/testerSchema"

interface DeleteTesterDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  tester: Tester | null
}

export const DeleteTesterDialog: React.FC<DeleteTesterDialogProps> = ({
  open,
  onOpenChange,
  tester,
}) => {
  const deleteMutation = useDeleteTester()

  if (!tester) return null

  const handleDelete = () => {
    deleteMutation.mutate(
      { deviceId: tester.deviceId },
      {
        onSuccess: () => onOpenChange(false),
      }
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Remove Tester Device</DialogTitle>
          <DialogDescription>
            Are you sure you want to remove device{" "}
            <strong>{tester.deviceId}</strong>? It will immediately lose access
            to internal/beta preview channels and fall back to production.
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
            {deleteMutation.isPending ? "Removing..." : "Remove Device"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default DeleteTesterDialog
