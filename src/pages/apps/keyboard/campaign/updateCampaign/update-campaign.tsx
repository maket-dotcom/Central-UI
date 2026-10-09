import { useNavigate, useParams } from "react-router-dom"
import { useForm } from "react-hook-form"
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
import { Textarea } from "@/components/ui/textarea"
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
import { ArrowLeft, Code, ExternalLink } from "lucide-react"
import { IconBrandAndroid, IconBrandApple } from "@tabler/icons-react"
import SelectComponent from "@/components/inputComponents/select-component"
import { getFirstFormErrorMessage } from "@/utils/formUtils"

export default function UpdateCampaign() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [mediaResp, setMediaResp] = useState<MediaResponse | null>(null)
  const [extrasInput, setExtrasInput] = useState<string>("")
  const [extrasError, setExtrasError] = useState<string | null>(null)

  const [isIconRemoved, setIsIconRemoved] = useState<boolean>(false)

  const { data: campaignResp, isLoading } = useGetCampaignById(id || "")
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
    },
  })

  const watchedIcon = watch("icon")
  const watchedStatus = watch("status")

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
      })
      if (campaign.extras && Object.keys(campaign.extras).length > 0) {
        setExtrasInput(JSON.stringify(campaign.extras, null, 2))
      } else {
        setExtrasInput("")
      }
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

  // Validate extras JSON whenever modified
  const handleExtrasChange = (val: string) => {
    setExtrasInput(val)
    if (!val.trim()) {
      setExtrasError(null)
      return
    }
    try {
      const parsed = JSON.parse(val)
      if (
        typeof parsed !== "object" ||
        parsed === null ||
        Array.isArray(parsed)
      ) {
        setExtrasError("Extras must be a valid JSON key-value object")
      } else {
        setExtrasError(null)
      }
    } catch {
      setExtrasError("Invalid JSON syntax")
    }
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

    let parsedExtras: Record<string, unknown> | null = null
    if (extrasInput.trim()) {
      try {
        const parsed = JSON.parse(extrasInput.trim())
        if (
          typeof parsed === "object" &&
          parsed !== null &&
          !Array.isArray(parsed)
        ) {
          parsedExtras = parsed
        } else {
          toast.error("Extras must be a JSON object")
          return
        }
      } catch {
        toast.error("Invalid JSON in Extras field")
        return
      }
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
      extras: parsedExtras,
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

  return (
    <form
      onSubmit={handleSubmit(onSubmit, (formErrors) => {
        const errorMsg = getFirstFormErrorMessage(formErrors)
        if (errorMsg) {
          toast.error(errorMsg)
        }
      })}
      className="flex flex-1 flex-col gap-6"
    >
      <div className="flex flex-col gap-6">
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
              Update Campaign
            </h1>
            <p className="text-sm text-balance text-muted-foreground">
              Edit details, platform targets, or upload a new icon for &ldquo;
              {campaign?.name}&rdquo;
            </p>
          </div>
        </div>

        {/* 1. Basic Information Card */}
        <Card className="border border-border shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-semibold">
              1. Basic Information
            </CardTitle>
            <CardDescription className="text-xs">
              Primary display title and icon asset
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-5">
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
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Code className="size-4 text-muted-foreground" />
                <div>
                  <CardTitle className="text-sm font-semibold">
                    4. Additional Metadata (Extras)
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Arbitrary JSON metadata for tags, badges, or categories
                  </CardDescription>
                </div>
              </div>
              <span className="text-[11px] text-muted-foreground">
                Optional JSON format
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <Textarea
              id="extras"
              rows={4}
              placeholder={`{\n  "category": "audio",\n  "badge": "Hot",\n  "priority": 20\n}`}
              value={extrasInput}
              onChange={(e) => handleExtrasChange(e.target.value)}
              className="font-mono text-xs"
            />
            {extrasError && (
              <p className="mt-1.5 text-xs font-medium text-destructive">
                {extrasError}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex w-full flex-col gap-3 pt-2 sm:flex-row">
          <Button
            type="submit"
            className="w-full flex-1 cursor-pointer sm:w-auto"
            disabled={isPending || !!extrasError}
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
      </div>
    </form>
  )
}
