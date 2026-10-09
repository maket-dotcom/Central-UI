import { useDeleteCampaign } from "@/query/keyboard/useCampaign"
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
import type { Campaign } from "@/utils/schemas/keyboard/campaignSchema"

export default function DeleteCampaign({
  open,
  onOpenChange,
  campaign,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  campaign: Campaign | null
}) {
  const { mutate, isPending } = useDeleteCampaign()

  const handleDelete = () => {
    const targetId = campaign?._id || campaign?.id
    if (!targetId) return

    mutate(
      { id: targetId },
      {
        onSuccess: () => {
          onOpenChange(false)
        },
      }
    )
  }

  if (!campaign) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Delete Campaign</DialogTitle>
          <DialogDescription>
            Are you sure you want to permanently delete the campaign &ldquo;{campaign.name}&rdquo;?
            This hard-deletes the campaign and cleans up its associated icon image from storage.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isPending}
          >
            {isPending && <Loader />}
            {isPending ? "Deleting..." : "Delete Campaign"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
