import { useNavigate } from "react-router-dom"
import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  addCampaignSchema,
  type AddCampaignInputs,
  type PlatformCampaignConfig,
} from "@/utils/schemas/keyboard/campaignSchema"
import type { MediaResponse } from "@/configurations/types"
import { useCreateCampaign } from "@/query/keyboard/useCampaign"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card"
import { useEffect, useState } from "react"
import KeyboardSingleDropBox from "@/pages/apps/keyboard/components/keyboard-single-drop-box"
import Loader from "@/components/loader"
import { toast } from "sonner"
import { useDeleteMediaById } from "@/query/keyboard/useMedia"
import { ArrowLeft, Layers, FileCode2 } from "lucide-react"
import { IconBrandAndroid, IconBrandApple } from "@tabler/icons-react"
import SelectComponent from "@/components/inputComponents/select-component"
import { JsonEditorComponent } from "@/components/inputComponents/json-editor-component"
import { getFirstFormErrorMessage } from "@/utils/formUtils"

export default function AddCampaign() {
  const navigate = useNavigate()
  const [mediaResp, setMediaResp] = useState<MediaResponse | null>(null)

  const { mutate, isPending } = useCreateCampaign()
  const { mutate: deleteMediaMutate } = useDeleteMediaById()

  const {
    register,
    setValue,
    setError,
    clearErrors,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<AddCampaignInputs>({
    resolver: zodResolver(addCampaignSchema),
    defaultValues: {
      name: "",
      icon: undefined as unknown as AddCampaignInputs["icon"],
      status: "active",
      android: {
        packageName: "",
        link: "",
      },
      ios: {
        packageName: "",
        link: "",
      },
      extras: {},
    },
  })

  const watchedIcon = watch("icon")
  const watchedStatus = watch("status")
  const watchedExtras = (useWatch({ control, name: "extras" }) || {}) as Record<string, unknown>

  // Sync uploaded media into form icon object
  useEffect(() => {
    const assetId =
      mediaResp?.data?.ref?.id || mediaResp?.data?._id || mediaResp?.data?.id
    const assetLink =
      mediaResp?.data?.ref?.link ||
      mediaResp?.data?.link ||
      mediaResp?.data?.url ||
      mediaResp?.data?.link1
    const assetType =
      mediaResp?.data?.ref?.type || mediaResp?.data?.type || "campaign"

    if (assetId && assetLink) {
      clearErrors("icon")
      setValue(
        "icon",
        {
          id: assetId,
          link: assetLink,
          type: assetType,
        },
        { shouldValidate: true }
      )
    }
  }, [mediaResp, setValue, clearErrors])

  // Handler when user removes/deletes the icon from the drop box
  const handleIconRemove = () => {
    setMediaResp(null)
    setValue("icon", undefined as unknown as AddCampaignInputs["icon"], {
      shouldValidate: true,
    })
    setError("icon", {
      type: "manual",
      message: "Campaign icon is required",
    })
  }

  const onSubmit = (data: AddCampaignInputs) => {
    if (!data.icon || !data.icon.id) {
      setError("icon", {
        type: "manual",
        message: "Campaign icon is required",
      })
      toast.error("Please upload an icon asset for the campaign")
      return
    }

    // Clean up empty platform objects
    let androidPayload: PlatformCampaignConfig | undefined = undefined
    if (data.android?.packageName?.trim() || data.android?.link?.trim()) {
      androidPayload = {
        ...(data.android.packageName?.trim()
          ? { packageName: data.android.packageName.trim() }
          : {}),
        ...(data.android.link?.trim()
          ? { link: data.android.link.trim() }
          : {}),
      }
    }

    let iosPayload: PlatformCampaignConfig | undefined = undefined
    if (data.ios?.packageName?.trim() || data.ios?.link?.trim()) {
      iosPayload = {
        ...(data.ios.packageName?.trim()
          ? { packageName: data.ios.packageName.trim() }
          : {}),
        ...(data.ios.link?.trim() ? { link: data.ios.link.trim() } : {}),
      }
    }

    const payload: AddCampaignInputs = {
      name: data.name.trim(),
      icon: data.icon,
      status: data.status || "active",
      ...(androidPayload ? { android: androidPayload } : {}),
      ...(iosPayload ? { ios: iosPayload } : {}),
      ...(data.extras && Object.keys(data.extras).length > 0
        ? { extras: data.extras }
        : {}),
    }

    mutate(
      { body: payload },
      {
        onSuccess: () => {
          navigate("/keyboard/campaign/list")
        },
      }
    )
  }

  // Clean up session media from storage if user cancels/leaves without creating
  const handleCancel = () => {
    const sessionMediaId = mediaResp?.data?._id || mediaResp?.data?.id
    if (sessionMediaId) {
      deleteMediaMutate({ id: sessionMediaId }, {})
    }
    navigate("/keyboard/campaign/list")
  }

  return (
    <div className="flex flex-1 flex-col gap-6 w-full">
      {/* Header with back navigation */}
      <div className="flex items-center gap-4">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={handleCancel}
          aria-label="Back to campaigns"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex cursor-default flex-col gap-1 text-left">
          <h1 className="text-2xl font-bold tracking-tight">
            Create New Campaign
          </h1>
          <p className="text-sm text-balance text-muted-foreground">
            Configure promoted shortcut suggestions, platform-specific
            targets, and icon assets
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit, (formErrors) => {
          const errorMsg = getFirstFormErrorMessage(formErrors)
          if (errorMsg) {
            toast.error(errorMsg)
          }
        })}
        className="flex flex-col gap-6"
      >
        {/* 1. Basic Information Section */}
        <Card className="border border-border shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-primary" />
              <CardTitle className="text-base font-semibold">
                1. Basic Information
              </CardTitle>
            </div>
            <CardDescription className="text-xs">
              Primary display title and keyboard icon asset
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-5">
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="name">Campaign Name *</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="e.g. Spotify Music"
                  aria-invalid={errors.name ? "true" : "false"}
                  {...register("name")}
                />
                {errors.name && (
                  <p className="text-xs font-medium text-destructive">
                    {errors.name.message}
                  </p>
                )}
              </div>

              {/* Campaign Status */}
              <div className="grid gap-2">
                <Label htmlFor="status">Campaign Status</Label>
                <SelectComponent
                  id="status"
                  value={watchedStatus || "active"}
                  onValueChange={(val) =>
                    setValue("status", val as "active" | "paused", {
                      shouldValidate: true,
                    })
                  }
                  data={[
                    {
                      name: "Active (Visible to keyboard clients)",
                      value: "active",
                    },
                    {
                      name: "Paused (Hidden from keyboard clients)",
                      value: "paused",
                    },
                  ]}
                />
                <p className="text-xs text-muted-foreground">
                  Only active campaigns are served to mobile keyboards. Paused
                  campaigns are excluded.
                </p>
              </div>
            </div>

            {/* 2-Step Icon Upload */}
            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="icon-upload">Campaign Icon *</Label>
                {watchedIcon?.id && (
                  <span className="font-mono text-xs text-muted-foreground">
                    Asset ID: {watchedIcon.id}
                  </span>
                )}
              </div>
              <KeyboardSingleDropBox
                id="icon-upload"
                setMediaResp={setMediaResp}
                type="campaign"
                onRemove={handleIconRemove}
                errorTooltip={
                  errors?.icon?.message ||
                  (errors?.icon?.id?.message as string) ||
                  (errors?.icon ? "Campaign icon is required" : "")
                }
                className="h-28"
                aspectRatioText="1:1"
              />
              {errors.icon && (
                <p className="text-xs font-medium text-destructive">
                  {errors.icon.message || "Campaign icon is required"}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Platform Configurations Grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* 2. Android Configuration Card */}
          <Card className="border border-border shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <div className="flex size-7 items-center justify-center rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <IconBrandAndroid className="size-4" />
                </div>
                <div>
                  <CardTitle className="text-sm font-semibold">
                    2. Android Configuration
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Optional Android package and deep link
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="grid gap-2">
                <Label
                  htmlFor="android-package"
                  className="text-xs font-medium"
                >
                  Package Name
                </Label>
                <Input
                  id="android-package"
                  type="text"
                  placeholder="com.spotify.music"
                  {...register("android.packageName")}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="android-link" className="text-xs font-medium">
                  Play Store / Attribution Link
                </Label>
                <Input
                  id="android-link"
                  type="url"
                  placeholder="https://play.google.com/store/apps/details?id=..."
                  aria-invalid={errors.android?.link ? "true" : "false"}
                  {...register("android.link")}
                />
                {errors.android?.link && (
                  <p className="text-xs font-medium text-destructive">
                    {errors.android.link.message}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* 3. iOS Configuration Card */}
          <Card className="border border-border shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <div className="flex size-7 items-center justify-center rounded-md bg-zinc-500/10 text-zinc-700 dark:text-zinc-300">
                  <IconBrandApple className="size-4" />
                </div>
                <div>
                  <CardTitle className="text-sm font-semibold">
                    3. iOS Configuration
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Optional iOS bundle identifier and store link
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="grid gap-2">
                <Label htmlFor="ios-package" className="text-xs font-medium">
                  Bundle Identifier
                </Label>
                <Input
                  id="ios-package"
                  type="text"
                  placeholder="com.spotify.client"
                  {...register("ios.packageName")}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="ios-link" className="text-xs font-medium">
                  App Store Link
                </Label>
                <Input
                  id="ios-link"
                  type="url"
                  placeholder="https://apps.apple.com/app/id324684580"
                  aria-invalid={errors.ios?.link ? "true" : "false"}
                  {...register("ios.link")}
                />
                {errors.ios?.link && (
                  <p className="text-xs font-medium text-destructive">
                    {errors.ios.link.message}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 4. Extras Metadata Section */}
        <Card className="border border-border shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <FileCode2 className="h-4 w-4 text-primary" />
              <CardTitle className="text-base font-semibold">
                3. Additional Metadata (Extras)
              </CardTitle>
            </div>
            <CardDescription className="text-xs">
              Optional arbitrary JSON payload metadata for custom keyboard properties
            </CardDescription>
          </CardHeader>
          <CardContent>
            <JsonEditorComponent
              id="extras-editor"
              label="JSON Extras Object"
              value={watchedExtras}
              onChange={(parsedVal) => {
                setValue("extras", parsedVal, { shouldValidate: true })
              }}
              disabled={isPending}
              error={
                errors.extras?.message
                  ? String(errors.extras.message)
                  : undefined
              }
              minHeight="180px"
            />
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex w-full flex-col gap-3 pt-2 sm:flex-row">
          <Button
            type="submit"
            className="w-full flex-1 cursor-pointer sm:w-auto"
            disabled={isPending}
          >
            {isPending && <Loader />}
            Create Campaign
          </Button>

          <Button
            type="button"
            variant="outline"
            className="w-full flex-1 cursor-pointer sm:w-auto"
            onClick={handleCancel}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  )
}
