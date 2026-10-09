import { useEffect } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import SelectComponent from "@/components/inputComponents/select-component"
import Loader from "@/components/loader"
import { toast } from "sonner"
import { getFirstFormErrorMessage } from "@/utils/formUtils"
import { useUpsertTester } from "@/query/keyboard/useTester"
import {
  upsertTesterSchema,
  type UpsertTesterInputs,
  type Tester,
} from "@/utils/schemas/keyboard/testerSchema"

interface TesterDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  tester?: Tester | null
}

export const TesterDialog: React.FC<TesterDialogProps> = ({
  open,
  onOpenChange,
  tester,
}) => {
  const isEditing = !!tester
  const upsertTesterMutation = useUpsertTester()

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<UpsertTesterInputs>({
    resolver: zodResolver(upsertTesterSchema),
    defaultValues: {
      deviceId: "",
      channel: "internal",
      name: "",
    },
  })

  useEffect(() => {
    if (tester) {
      reset({
        deviceId: tester.deviceId,
        channel: tester.channel,
        name: tester.name || "",
      })
    } else {
      reset({
        deviceId: "",
        channel: "internal",
        name: "",
      })
    }
  }, [tester, reset])

  const onSubmit = (data: UpsertTesterInputs) => {
    upsertTesterMutation.mutate(
      {
        deviceId: data.deviceId,
        body: {
          channel: data.channel,
          name: data.name,
        },
      },
      {
        onSuccess: () => {
          onOpenChange(false)
          reset()
        },
      }
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Tester Device" : "Enroll Tester Device"}
          </DialogTitle>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(onSubmit, (formErrors) => {
            const errorMsg = getFirstFormErrorMessage(formErrors)
            if (errorMsg) {
              toast.error(errorMsg)
            }
          })}
          className="space-y-4 py-2"
        >
          {/* Device ID */}
          <div className="space-y-2">
            <Label htmlFor="deviceId">Device ID *</Label>
            <Input
              id="deviceId"
              placeholder="e.g. pixel-7-qa-01"
              disabled={isEditing || upsertTesterMutation.isPending}
              {...register("deviceId")}
            />
            {errors.deviceId && (
              <p className="text-xs text-destructive">
                {errors.deviceId.message}
              </p>
            )}
            {isEditing && (
              <p className="text-xs text-muted-foreground">
                Device identifier is unique and cannot be modified.
              </p>
            )}
          </div>

          {/* Channel */}
          <div className="space-y-2">
            <Label htmlFor="channel">Target Channel *</Label>
            <Controller
              name="channel"
              control={control}
              render={({ field }) => (
                <SelectComponent
                  id="channel"
                  value={field.value}
                  onValueChange={field.onChange}
                  placeholder="Select channel"
                  disabled={upsertTesterMutation.isPending}
                  data={[
                    { name: "Internal (QA & Staff)", value: "internal" },
                    { name: "Beta (Public Testers)", value: "beta" },
                  ]}
                  className="w-full"
                />
              )}
            />
            {errors.channel && (
              <p className="text-xs text-destructive">
                {errors.channel.message}
              </p>
            )}
          </div>

          {/* Name / Label */}
          <div className="space-y-2">
            <Label htmlFor="name">Friendly Name / Owner</Label>
            <Input
              id="name"
              placeholder="e.g. QA Lab Pixel 7"
              disabled={upsertTesterMutation.isPending}
              {...register("name")}
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={upsertTesterMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={upsertTesterMutation.isPending}
              className="cursor-pointer"
            >
              {upsertTesterMutation.isPending && <Loader />}
              {isEditing ? "Save Changes" : "Enroll Device"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default TesterDialog
