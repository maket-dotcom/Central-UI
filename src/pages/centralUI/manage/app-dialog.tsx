import React, { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Loader from "@/components/loader"
import { toast } from "sonner"
import { getFirstFormErrorMessage } from "@/utils/formUtils"
import { useAddApp, useUpdateApp } from "@/query/useAppInfo"
import {
  addAppSchema,
  type AppInfo,
  type AddAppInputs,
} from "@/utils/schemas/appInfoSchema"

interface AppDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  app?: AppInfo | null
  onSuccess?: () => void
}

export const AppDialog: React.FC<AppDialogProps> = ({
  open,
  onOpenChange,
  app,
  onSuccess,
}) => {
  const isEditing = !!app
  const addAppMutation = useAddApp()
  const updateAppMutation = useUpdateApp()

  const isPending = addAppMutation.isPending || updateAppMutation.isPending

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AddAppInputs>({
    resolver: zodResolver(addAppSchema),
    defaultValues: {
      appName: "",
      backendBaseUrl: "",
    },
  })

  // Sync initial values into form on open or target change
  useEffect(() => {
    if (open) {
      if (app) {
        reset({
          appName: app.appName,
          backendBaseUrl: app.backendBaseUrl,
        })
      } else {
        reset({
          appName: "",
          backendBaseUrl: "",
        })
      }
    }
  }, [open, app, reset])

  const onSubmit = (data: AddAppInputs) => {
    const trimmedAppName = data.appName.trim()
    const trimmedUrl = data.backendBaseUrl.trim().replace(/\/+$/, "")

    if (isEditing && app) {
      updateAppMutation.mutate(
        {
          id: app._id,
          body: {
            appName: trimmedAppName,
            backendBaseUrl: trimmedUrl,
          },
        },
        {
          onSuccess: () => {
            onOpenChange(false)
            reset()
            onSuccess?.()
          },
        }
      )
    } else {
      addAppMutation.mutate(
        {
          body: {
            appName: trimmedAppName,
            backendBaseUrl: trimmedUrl,
          },
        },
        {
          onSuccess: () => {
            onOpenChange(false)
            reset()
            onSuccess?.()
          },
        }
      )
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing
              ? "Edit Application Metadata"
              : "Register New Application"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? `Update metadata and backend service URL for ${app?.appName}.`
              : "Register a new application workspace in Central-Backend."}
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(onSubmit, (formErrors) => {
            const errorMsg = getFirstFormErrorMessage(formErrors)
            if (errorMsg) {
              toast.error(errorMsg)
            }
          })}
          className="flex flex-col gap-4 py-2"
        >
          {/* App Name */}
          <div className="grid gap-2">
            <Label htmlFor="appName">App Name *</Label>
            <Input
              id="appName"
              type="text"
              placeholder="e.g. adsshare"
              autoFocus
              aria-invalid={errors.appName ? "true" : "false"}
              disabled={isPending}
              {...register("appName")}
            />
            {errors.appName && (
              <p className="text-xs font-medium text-destructive">
                {errors.appName.message}
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              Unique application identifier (1–100 characters).
            </p>
          </div>

          {/* Backend Base URL */}
          <div className="grid gap-2">
            <Label htmlFor="backendBaseUrl">Backend Base URL *</Label>
            <Input
              id="backendBaseUrl"
              type="url"
              placeholder="https://api.example.com"
              aria-invalid={errors.backendBaseUrl ? "true" : "false"}
              disabled={isPending}
              {...register("backendBaseUrl")}
            />
            {errors.backendBaseUrl && (
              <p className="text-xs font-medium text-destructive">
                {errors.backendBaseUrl.message}
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              Valid URI scheme (http or https). Trailing slashes are stripped
              automatically.
            </p>
          </div>

          <DialogFooter className="mt-4 gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader />}
              {isPending
                ? isEditing
                  ? "Saving..."
                  : "Registering..."
                : isEditing
                  ? "Save Changes"
                  : "Register App"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default AppDialog
