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
import CentralSingleDropBox from "./central-single-drop-box"
import { getContrastTextColor, deriveThemePalettes } from "@/utils/themeApplier"
import { Palette, Sparkles } from "lucide-react"

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
    setValue,
    watch,
    formState: { errors },
  } = useForm<AddAppInputs>({
    resolver: zodResolver(addAppSchema),
    defaultValues: {
      appName: "",
      backendBaseUrl: "",
      logo: null,
      theme: {
        primary: "#059669",
      },
    },
  })

  const currentLogo = watch("logo")
  const primaryColor = watch("theme.primary") || "#059669"
  const palettes = deriveThemePalettes(primaryColor)

  // Sync initial values into form on open or target change
  useEffect(() => {
    if (open) {
      if (app) {
        reset({
          appName: app.appName,
          backendBaseUrl: app.backendBaseUrl,
          logo: app.logo
            ? {
                id: app.logo.id,
                link: app.logo.link,
                type: app.logo.type || "logo",
              }
            : null,
          theme: {
            primary: app.theme?.primary || "#059669",
          },
        })
      } else {
        reset({
          appName: "",
          backendBaseUrl: "",
          logo: null,
          theme: {
            primary: "#059669",
          },
        })
      }
    }
  }, [open, app, reset])


  const onSubmit = (data: AddAppInputs) => {
    const trimmedAppName = data.appName.trim()
    const trimmedUrl = data.backendBaseUrl.trim().replace(/\/+$/, "")
    const logoPayload =
      data.logo && data.logo.id && data.logo.link
        ? {
            id: String(data.logo.id),
            link: String(data.logo.link),
            type: data.logo.type ? String(data.logo.type) : "logo",
          }
        : null

    const themePayload = {
      primary: (data.theme?.primary || "#059669").trim(),
    }

    if (isEditing && app) {
      updateAppMutation.mutate(
        {
          id: app._id,
          body: {
            appName: trimmedAppName,
            backendBaseUrl: trimmedUrl,
            logo: logoPayload,
            theme: themePayload,
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
            logo: logoPayload,
            theme: themePayload,
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
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing
              ? "Edit Application Metadata"
              : "Register New Application"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? `Update metadata, logo, brand colors, and backend URL for ${app?.appName}.`
              : "Register a new application workspace with custom logo and 3 brand colors."}
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(onSubmit, (formErrors) => {
            const errorMsg = getFirstFormErrorMessage(formErrors)
            if (errorMsg) {
              toast.error(errorMsg)
            }
          })}
          className="flex flex-col gap-5 py-2"
        >
          {/* App Logo */}
          <div className="grid gap-2">
            <Label htmlFor="appLogo">App Logo *</Label>
            <CentralSingleDropBox
              id="appLogo"
              type={"logo" as any}
              previousMediaId={currentLogo?.id || undefined}
              previousMediaLink={currentLogo?.link}
              setMediaResp={(resp) => {
                const mediaObj = (resp as any)?.data?.data || resp?.data
                const mediaId = mediaObj?._id || mediaObj?.id
                const mediaLink = mediaObj?.url || mediaObj?.link

                if (mediaId && mediaLink) {
                  setValue(
                    "logo",
                    {
                      id: String(mediaId),
                      link: String(mediaLink),
                      type: mediaObj?.type || "logo",
                    },
                    { shouldValidate: true }
                  )
                } else {
                  setValue("logo", null, { shouldValidate: true })
                }
              }}
              onRemove={() => {
                setValue("logo", null, { shouldValidate: true })
              }}
            />
            {errors.logo ? (
              <p className="text-xs font-semibold text-destructive">
                {errors.logo.message || "App logo is required"}
              </p>
            ) : (
              <p className="text-xs text-muted-foreground">
                Application logo is required (PNG, JPEG, WebP, GIF, max 2MB).
              </p>
            )}
          </div>

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
              Valid URI scheme (http or https). Trailing slashes are stripped automatically.
            </p>
          </div>

          {/* App Theme Branding (Single Brand Color) */}
          <div className="grid gap-3.5 rounded-xl border bg-muted/20 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Palette className="size-4 text-primary" />
                <Label className="text-sm font-semibold">Brand Color</Label>
              </div>
              <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                <Sparkles className="size-3 text-primary" />
                Auto-adapts to Light & Dark modes
              </span>
            </div>


            {/* Single Brand Color Input */}
            <div className="grid gap-1.5 pt-1">
              <Label htmlFor="themePrimary" className="text-xs font-medium">
                Primary Brand Color *
              </Label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  id="themePrimaryPicker"
                  value={primaryColor.startsWith("#") ? primaryColor : "#059669"}
                  onChange={(e) =>
                    setValue("theme.primary", e.target.value, { shouldValidate: true })
                  }
                  className="size-9 shrink-0 cursor-pointer rounded-md border bg-transparent p-0.5"
                />
                <Input
                  id="themePrimary"
                  placeholder="#059669"
                  value={primaryColor}
                  onChange={(e) =>
                    setValue("theme.primary", e.target.value, { shouldValidate: true })
                  }
                  className="font-mono text-xs uppercase max-w-[140px]"
                />
                <span className="text-xs text-muted-foreground">
                  Drives buttons, active tabs, and adaptive sidebars.
                </span>
              </div>
              {errors.theme?.primary && (
                <p className="text-[11px] text-destructive">
                  {errors.theme.primary.message}
                </p>
              )}
            </div>

            {/* Live Theme Preview: Light Mode vs Dark Mode */}
            <div className="mt-1 space-y-2 rounded-lg border bg-background/90 p-3 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground">
                  Adaptive Theme Preview:
                </span>
                <span className="text-[11px] text-muted-foreground">
                  Sidebars auto-adjust for Light vs Dark mode
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {/* Light Mode Mini Preview */}
                <div className="flex flex-col gap-1.5 rounded-lg border p-2.5 bg-slate-50 text-slate-900 shadow-2xs">
                  <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500">
                    <span>Light Mode</span>
                    <span className="text-[10px] uppercase tracking-wider text-emerald-600 font-bold">Luminous</span>
                  </div>
                  <div className="flex items-stretch gap-2 overflow-hidden rounded border bg-white p-1.5">
                    {/* Mini Sidebar */}
                    <div
                      className="flex w-24 shrink-0 flex-col gap-1 rounded p-1.5 text-[10px] shadow-2xs"
                      style={{
                        backgroundColor: palettes.light.sidebarBg,
                        border: `1px solid ${palettes.light.sidebarBorder}`,
                        color: palettes.light.sidebarFg,
                      }}
                    >
                      <div className="flex items-center gap-1 font-bold">
                        <span
                          className="size-1.5 rounded-full"
                          style={{ backgroundColor: primaryColor }}
                        />
                        <span className="truncate">Sidebar</span>
                      </div>
                      <div
                        className="mt-0.5 rounded px-1 py-0.5 font-medium"
                        style={{
                          backgroundColor: palettes.light.sidebarAccent,
                          color: palettes.light.sidebarAccentFg,
                        }}
                      >
                        Active
                      </div>
                      <div className="px-1 py-0.5 text-slate-500 text-[9px]">Menu</div>
                    </div>
                    {/* Mini Content */}
                    <div className="flex flex-1 flex-col justify-center gap-1.5 p-1">
                      <button
                        type="button"
                        tabIndex={-1}
                        className="rounded px-2 py-0.5 text-[10px] font-semibold shadow-2xs w-fit"
                        style={{
                          backgroundColor: primaryColor,
                          color: getContrastTextColor(primaryColor),
                        }}
                      >
                        Action Button
                      </button>
                      <span
                        className="rounded px-1.5 py-0.5 text-[9px] font-medium w-fit"
                        style={{
                          backgroundColor: palettes.light.secondaryBg,
                          color: palettes.light.secondaryFg,
                        }}
                      >
                        Brand Badge
                      </span>
                    </div>
                  </div>
                </div>

                {/* Dark Mode Mini Preview */}
                <div className="flex flex-col gap-1.5 rounded-lg border border-slate-800 p-2.5 bg-slate-950 text-slate-100 shadow-2xs">
                  <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400">
                    <span>Dark Mode</span>
                    <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Charcoal</span>
                  </div>
                  <div className="flex items-stretch gap-2 overflow-hidden rounded border border-slate-800 bg-slate-900 p-1.5">
                    {/* Mini Sidebar */}
                    <div
                      className="flex w-24 shrink-0 flex-col gap-1 rounded p-1.5 text-[10px] shadow-2xs"
                      style={{
                        backgroundColor: palettes.dark.sidebarBg,
                        border: `1px solid ${palettes.dark.sidebarBorder}`,
                        color: palettes.dark.sidebarFg,
                      }}
                    >
                      <div className="flex items-center gap-1 font-bold">
                        <span
                          className="size-1.5 rounded-full"
                          style={{ backgroundColor: primaryColor }}
                        />
                        <span className="truncate">Sidebar</span>
                      </div>
                      <div
                        className="mt-0.5 rounded px-1 py-0.5 font-medium"
                        style={{
                          backgroundColor: palettes.dark.sidebarAccent,
                          color: palettes.dark.sidebarAccentFg,
                        }}
                      >
                        Active
                      </div>
                      <div className="px-1 py-0.5 text-slate-400 text-[9px]">Menu</div>
                    </div>
                    {/* Mini Content */}
                    <div className="flex flex-1 flex-col justify-center gap-1.5 p-1">
                      <button
                        type="button"
                        tabIndex={-1}
                        className="rounded px-2 py-0.5 text-[10px] font-semibold shadow-2xs w-fit"
                        style={{
                          backgroundColor: primaryColor,
                          color: getContrastTextColor(primaryColor),
                        }}
                      >
                        Action Button
                      </button>
                      <span
                        className="rounded px-1.5 py-0.5 text-[9px] font-medium w-fit"
                        style={{
                          backgroundColor: palettes.dark.secondaryBg,
                          color: palettes.dark.secondaryFg,
                        }}
                      >
                        Brand Badge
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
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
