import { useNavigate, useParams } from "react-router-dom"
import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  updateCampaignSchema,
  type UpdateCampaignInputs,
  type PlatformCampaignConfig,
  type Campaign,
} from "@/utils/schemas/keyboard/campaignSchema"
import type { MediaResponse } from "@/configurations/types"
import {
  useGetCampaignById,
  useUpdateCampaign,
} from "@/query/keyboard/useCampaign"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
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
import { ArrowLeft, Layers, FileCode2, ExternalLink } from "lucide-react"
import { IconBrandAndroid, IconBrandApple } from "@tabler/icons-react"
import SelectComponent from "@/components/inputComponents/select-component"
import { JsonEditorComponent } from "@/components/inputComponents/json-editor-component"
import { getFirstFormErrorMessage } from "@/utils/formUtils"

export default function UpdateCampaign() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [mediaResp, setMediaResp] = useState<MediaResponse | null>(null)

  const [isIconRemoved, setIsIconRemoved] = useState<boolean>(false)

  const { data: campaignResp, isLoading, isError } = useGetCampaignById(id || "")
  const { mutate, isPending } = useUpdateCampaign()
  const { mutate: deleteMediaMutate } = useDeleteMediaById()

  // Safely extract campaign from backend envelope
  const campaign: Campaign | undefined =
    campaignResp?.data &&
    typeof campaignResp.data === "object" &&
    !Array.isArray(campaignResp.data)
      ? (campaignResp.data as Campaign)
      : (campaignResp as Campaign | undefined)

  const {
    register,
    setValue,
    setError,
    clearErrors,
    handleSubmit,
    control,
    reset,
    watch,
    formState: { errors },
  } = useForm<UpdateCampaignInputs>({
    resolver: zodResolver(updateCampaignSchema),
    defaultValues: {
      name: "",
      icon: undefined,
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

  // Hydrate form when campaign data loads
  useEffect(() => {
    if (campaign) {
      setIsIconRemoved(false)
      reset({
        name: campaign.name || "",
        icon: campaign.icon,
        status: campaign.status || "active",
        android: {
          packageName: campaign.android?.packageName || "",
          link: campaign.android?.link || "",
        },
        ios: {
          packageName: campaign.ios?.packageName || "",
          link: campaign.ios?.link || "",
        },
        extras: campaign.extras || {},
      })
    }
  }, [campaign, reset])

  // Sync newly uploaded media into icon field
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
      setIsIconRemoved(false)
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
    setIsIconRemoved(true)
    setMediaResp(null)
    setValue("icon", undefined as unknown as UpdateCampaignInputs["icon"], {
      shouldValidate: true,
    })
    setError("icon", {
      type: "manual",
      message: "Campaign icon is required",
    })
  }

  const onSubmit = (data: UpdateCampaignInputs) => {
    if (!id) return

    if (!data.icon || !data.icon.id) {
      setError("icon", {
        type: "manual",
        message: "Campaign icon is required",
      })
      toast.error("Please upload an icon asset for the campaign")
      return
    }

    const androidPayload: PlatformCampaignConfig | null =
      data.android?.packageName?.trim() || data.android?.link?.trim()
        ? {
            ...(data.android.packageName?.trim()
              ? { packageName: data.android.packageName.trim() }
              : {}),
            ...(data.android.link?.trim()
              ? { link: data.android.link.trim() }
              : {}),
          }
        : null

    const iosPayload: PlatformCampaignConfig | null =
      data.ios?.packageName?.trim() || data.ios?.link?.trim()
        ? {
            ...(data.ios.packageName?.trim()
              ? { packageName: data.ios.packageName.trim() }
              : {}),
            ...(data.ios.link?.trim() ? { link: data.ios.link.trim() } : {}),
          }
        : null

    const payload: UpdateCampaignInputs = {
      name: data.name?.trim(),
      icon: data.icon,
      status: data.status,
      android: androidPayload,
      ios: iosPayload,
      extras: data.extras || null,
    }

    mutate(
      { id, body: payload },
      {
        onSuccess: () => {
          const currentMediaId = mediaResp?.data?._id || mediaResp?.data?.id
          const previousMediaId = campaign?.icon?.id
          if (
            currentMediaId &&
            previousMediaId &&
            currentMediaId !== previousMediaId
          ) {
            deleteMediaMutate({ id: previousMediaId }, {})
          }
          navigate("/keyboard/campaign/list")
        },
      }
    )
  }

  // Clean up newly uploaded session media if user cancels without saving
  const handleCancel = () => {
    const sessionMediaId = mediaResp?.data?._id || mediaResp?.data?.id
    if (
      sessionMediaId &&
      campaign?.icon?.id &&
      sessionMediaId !== campaign.icon.id
    ) {
      deleteMediaMutate({ id: sessionMediaId }, {})
    }
    navigate("/keyboard/campaign/list")
  }

  if (isLoading) {
    return (
      <div className="flex min-h-100 flex-col items-center justify-center gap-3 p-8 text-center">
        <Loader size={32} />
        <p className="text-sm text-muted-foreground">
          Loading campaign details...
        </p>
      </div>
    )
  }

  if (isError || !campaign) {
    return (
      <div className="flex flex-1 flex-col gap-6 w-full">
        <div className="overflow-hidden rounded-xl border border-destructive/30 bg-destructive/10 p-8 text-center">
          <h2 className="text-base font-semibold text-destructive">
            Campaign Not Found
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            The requested campaign could not be found or has been removed.
          </p>
          <Button
            onClick={handleCancel}
            variant="outline"
            size="sm"
            className="mt-4 cursor-pointer"
          >
            Back to Campaigns
          </Button>
        </div>
      </div>
    )
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
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight">
              Update Campaign
            </h1>
            {campaign.status && (
              <Badge
                variant={campaign.status === "active" ? "default" : "secondary"}
                className="capitalize text-xs"
              >
                {campaign.status}
              </Badge>
            )}
            {campaign.android?.packageName && (
              <Badge variant="outline" className="text-xs">
                Android
              </Badge>
            )}
            {campaign.ios?.packageName && (
              <Badge variant="outline" className="text-xs">
                iOS
              </Badge>
            )}
          </div>
          <p className="text-sm text-balance text-muted-foreground">
            Edit details, platform targets, or upload a new icon for &ldquo;
            {campaign.name}&rdquo;
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
        {/* 1. Basic Information Card */}
        <Card className="border border-border shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-primary" />
              <CardTitle className="text-base font-semibold">
                1. Basic Information
              </CardTitle>
            </div>
            <CardDescription className="text-xs">
              Primary display title and icon asset
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-5">
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="name">Campaign Name</Label>
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

            {/* Icon upload & replace */}
            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="icon-upload">Change Icon</Label>
                {watchedIcon?.id && (
                  <span className="font-mono text-xs text-muted-foreground">
                    Active Asset ID: {watchedIcon.id}
                  </span>
                )}
              </div>
              <KeyboardSingleDropBox
                id="icon-upload"
                setMediaResp={setMediaResp}
                previousMediaId={isIconRemoved ? undefined : campaign?.icon?.id}
                previousMediaLink={isIconRemoved ? null : campaign?.icon?.link}
                previousMediaName={isIconRemoved ? undefined : campaign?.name}
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

              {/* Display active icon link */}
              {!isIconRemoved && campaign?.icon?.link && !mediaResp && (
                <p className="text-xs text-muted-foreground">
                  Current icon URL:{" "}
                  <a
                    href={campaign.icon.link}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-primary hover:underline"
                  >
                    <span className="break-all">{campaign.icon.link}</span>
                    <ExternalLink className="inline h-3 w-3" />
                  </a>
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

        {/* Actions */}
        <div className="flex w-full flex-col gap-3 pt-2 sm:flex-row">
          <Button
            type="submit"
            className="w-full flex-1 cursor-pointer sm:w-auto"
            disabled={isPending}
          >
            {isPending && <Loader />}
            Update Campaign
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
