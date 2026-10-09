import React, { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { useForm, Controller, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  ArrowLeft,
  Flag,
  Layers,
  Smartphone,
  FileCode2,
  Sliders,
  Plus,
  X,
} from "lucide-react"
import { IconBrandAndroid, IconBrandApple } from "@tabler/icons-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card"
import Loader from "@/components/loader"
import { JsonEditorComponent } from "@/components/inputComponents/json-editor-component"
import { toast } from "sonner"
import { getFirstFormErrorMessage } from "@/utils/formUtils"
import {
  patchFeatureSchema,
  type PatchFeatureInputs,
  type FeaturePlatform,
  type FeatureChannel,
} from "@/utils/schemas/keyboard/featureSchema"
import { useGetFeatureByKey, useUpdateFeature } from "@/query/keyboard/useFeature"

const PLATFORMS: { value: FeaturePlatform; label: string; icon: React.ReactNode }[] = [
  {
    value: "android",
    label: "Android",
    icon: <IconBrandAndroid className="size-3.5 text-emerald-600 dark:text-emerald-400" />,
  },
  {
    value: "ios",
    label: "iOS",
    icon: <IconBrandApple className="size-3.5 text-zinc-600 dark:text-zinc-400" />,
  },
]

const CHANNELS: { value: FeatureChannel; label: string }[] = [
  { value: "internal", label: "Internal (QA)" },
  { value: "beta", label: "Beta" },
  { value: "production", label: "Production" },
]

export const UpdateFeature: React.FC = () => {
  const navigate = useNavigate()
  const { key } = useParams<{ key: string }>()

  const { data: featureResp, isLoading, isError } = useGetFeatureByKey(key || "")
  const updateMutation = useUpdateFeature()

  const feature = featureResp?.data

  const [deviceInput, setDeviceInput] = useState("")
  const [denyDeviceInput, setDenyDeviceInput] = useState("")

  const {
    register,
    handleSubmit,
    control,
    setValue,
    reset,
    formState: { errors },
  } = useForm<PatchFeatureInputs>({
    resolver: zodResolver(patchFeatureSchema),
    defaultValues: {
      description: "",
      enabled: false,
      platforms: ["android", "ios"],
      channels: ["internal", "beta", "production"],
      rolloutPercentage: 100,
      minBuildNumber: {},
      maxBuildNumber: {},
      allowDevices: [],
      denyDevices: [],
      payload: {},
    },
  })

  // Hydrate form values
  useEffect(() => {
    if (feature) {
      reset({
        description: feature.description || "",
        enabled: feature.enabled,
        platforms: feature.platforms || ["android", "ios"],
        channels: feature.channels || ["internal", "beta", "production"],
        rolloutPercentage: feature.rolloutPercentage,
        minBuildNumber: feature.minBuildNumber || {},
        maxBuildNumber: feature.maxBuildNumber || {},
        allowDevices: feature.allowDevices || [],
        denyDevices: feature.denyDevices || [],
        payload: feature.payload || {},
      })
    }
  }, [feature, reset])

  const currentPlatforms = useWatch({ control, name: "platforms" }) || []
  const currentChannels = useWatch({ control, name: "channels" }) || []
  const currentRollout = useWatch({ control, name: "rolloutPercentage" })
  const allowDevices = useWatch({ control, name: "allowDevices" }) || []
  const denyDevices = useWatch({ control, name: "denyDevices" }) || []
  const currentPayload = useWatch({ control, name: "payload" }) || {}

  const handleTogglePlatform = (platform: FeaturePlatform) => {
    const next = currentPlatforms.includes(platform)
      ? currentPlatforms.filter((p: FeaturePlatform) => p !== platform)
      : [...currentPlatforms, platform]
    setValue("platforms", next, { shouldValidate: true })
  }

  const handleToggleChannel = (channel: FeatureChannel) => {
    const next = currentChannels.includes(channel)
      ? currentChannels.filter((c: FeatureChannel) => c !== channel)
      : [...currentChannels, channel]
    setValue("channels", next, { shouldValidate: true })
  }

  const handleAddAllowDevice = () => {
    const val = deviceInput.trim()
    if (!val || allowDevices.includes(val)) return
    setValue("allowDevices", [...allowDevices, val], { shouldValidate: true })
    setDeviceInput("")
  }

  const handleRemoveAllowDevice = (dev: string) => {
    setValue(
      "allowDevices",
      allowDevices.filter((d: string) => d !== dev),
      { shouldValidate: true }
    )
  }

  const handleAddDenyDevice = () => {
    const val = denyDeviceInput.trim()
    if (!val || denyDevices.includes(val)) return
    setValue("denyDevices", [...denyDevices, val], { shouldValidate: true })
    setDenyDeviceInput("")
  }

  const handleRemoveDenyDevice = (dev: string) => {
    setValue(
      "denyDevices",
      denyDevices.filter((d: string) => d !== dev),
      { shouldValidate: true }
    )
  }

  const onSubmit = (formData: PatchFeatureInputs) => {
    if (!key) return

    updateMutation.mutate(
      {
        key,
        body: formData,
      },
      {
        onSuccess: () => {
          navigate("/keyboard/features/list")
        },
      }
    )
  }

  const handleCancel = () => {
    navigate("/keyboard/features/list")
  }

  if (isLoading) {
    return (
      <div className="flex min-h-100 flex-col items-center justify-center gap-3 p-8 text-center">
        <Loader size={32} />
        <p className="text-sm text-muted-foreground">
          Loading feature flag details...
        </p>
      </div>
    )
  }

  if (isError || !feature) {
    return (
      <div className="flex flex-1 flex-col gap-6 w-full">
        <div className="overflow-hidden rounded-xl border border-destructive/30 bg-destructive/10 p-8 text-center">
          <h2 className="text-base font-semibold text-destructive">
            Feature Flag Not Found
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            The feature flag "{key}" does not exist or has been removed.
          </p>
          <Button
            onClick={handleCancel}
            variant="outline"
            size="sm"
            className="mt-4 cursor-pointer"
          >
            Back to Feature Flags
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
          aria-label="Back to feature flags"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex cursor-default flex-col gap-1 text-left">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight">
              Edit Feature Flag
            </h1>
            <Badge variant="outline" className="font-mono text-xs">
              {key}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Update targeting rules, rollout percentages, device whitelists, or payload
          </p>
        </div>
      </div>

      <form
        id="update-feature-form"
        onSubmit={handleSubmit(onSubmit, (formErrors) => {
          const errorMsg = getFirstFormErrorMessage(formErrors)
          if (errorMsg) {
            toast.error(errorMsg)
          }
        })}
        className="flex flex-col gap-6"
      >
        {/* 1. Identity & Master State */}
        <Card className="border border-border shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Flag className="h-4 w-4 text-primary" />
              <CardTitle className="text-base font-semibold">
                1. Feature Identity & State
              </CardTitle>
            </div>
            <CardDescription className="text-xs">
              Programmatic identifier and global killswitch
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* Read-Only Feature Key */}
              <div className="space-y-2">
                <Label>Feature Key</Label>
                <div className="flex h-10 w-full items-center rounded-md border border-input bg-muted px-3 font-mono text-sm font-semibold text-muted-foreground">
                  {key}
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Feature key is immutable to ensure client backward-compatibility.
                </p>
              </div>

              {/* Master Switch */}
              <div className="flex items-center justify-between rounded-lg border bg-muted/20 p-4">
                <div className="space-y-0.5">
                  <div className="font-semibold text-sm">Master Switch</div>
                  <p className="text-xs text-muted-foreground">
                    Globally enable or disable this feature flag.
                  </p>
                </div>
                <Controller
                  name="enabled"
                  control={control}
                  render={({ field }) => (
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      className="cursor-pointer"
                    />
                  )}
                />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Explain what functionality this feature flag gates..."
                rows={2}
                className="text-xs"
                {...register("description")}
              />
              {errors.description && (
                <p className="text-xs text-destructive">
                  {errors.description.message}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 2. Platform & Channel Targeting */}
        <Card className="border border-border shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Sliders className="h-4 w-4 text-primary" />
              <CardTitle className="text-base font-semibold">
                2. Platform & Channel Targeting
              </CardTitle>
            </div>
            <CardDescription className="text-xs">
              Restrict feature availability to specific OS platforms, distribution channels, and rollout percentages
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* Platforms */}
              <div className="space-y-2">
                <Label>Target Platforms *</Label>
                <div className="flex flex-wrap gap-2">
                  {PLATFORMS.map((plat) => {
                    const isSelected = currentPlatforms.includes(plat.value)
                    return (
                      <button
                        key={plat.value}
                        type="button"
                        onClick={() => handleTogglePlatform(plat.value)}
                        className={`inline-flex cursor-pointer items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium transition-all ${
                          isSelected
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border bg-background text-muted-foreground hover:bg-muted"
                        }`}
                      >
                        {plat.icon}
                        <span>{plat.label}</span>
                        {isSelected && (
                          <span className="size-1.5 rounded-full bg-primary" />
                        )}
                      </button>
                    )
                  })}
                </div>
                {errors.platforms && (
                  <p className="text-xs text-destructive">
                    {errors.platforms.message}
                  </p>
                )}
              </div>

              {/* Rollout % */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="rolloutPercentage">Rollout Percentage</Label>
                  <span className="font-mono text-xs font-semibold text-primary">
                    {currentRollout ?? 100}%
                  </span>
                </div>
                <Controller
                  name="rolloutPercentage"
                  control={control}
                  render={({ field }) => (
                    <div className="flex items-center gap-4 pt-1">
                      <Slider
                        id="rolloutPercentage"
                        value={field.value ?? 100}
                        onValueChange={(val) => {
                          const num = Array.isArray(val) ? val[0] : val
                          field.onChange(num)
                        }}
                        min={0}
                        max={100}
                        step={5}
                        className="flex-1"
                      />
                      <Input
                        type="number"
                        min={0}
                        max={100}
                        value={field.value ?? 100}
                        onChange={(e) => {
                          const val = Number(e.target.value)
                          if (!isNaN(val)) {
                            field.onChange(Math.min(100, Math.max(0, val)))
                          }
                        }}
                        className="w-16 text-center font-mono text-xs"
                      />
                    </div>
                  )}
                />
                {errors.rolloutPercentage && (
                  <p className="text-xs text-destructive">
                    {errors.rolloutPercentage.message}
                  </p>
                )}
              </div>
            </div>

            {/* Channels Checklist */}
            <div className="space-y-2">
              <Label>Active Channels *</Label>
              <div className="flex flex-wrap gap-2">
                {CHANNELS.map((ch) => {
                  const isSelected = currentChannels.includes(ch.value)
                  return (
                    <button
                      key={ch.value}
                      type="button"
                      onClick={() => handleToggleChannel(ch.value)}
                      className={`inline-flex cursor-pointer items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium transition-all ${
                        isSelected
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border bg-background text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      <span>{ch.label}</span>
                      {isSelected && (
                        <span className="size-1.5 rounded-full bg-primary" />
                      )}
                    </button>
                  )
                })}
              </div>
              {errors.channels && (
                <p className="text-xs text-destructive">
                  {errors.channels.message}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 3. Build Number Thresholds */}
        <Card className="border border-border shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-primary" />
              <CardTitle className="text-base font-semibold">
                3. Build Number Thresholds (Optional)
              </CardTitle>
            </div>
            <CardDescription className="text-xs">
              Limit flag evaluation to specific Android and iOS app build versions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* Android Build Range */}
              <div className="space-y-3 rounded-lg border bg-muted/10 p-3">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                  <IconBrandAndroid className="size-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Android Build Bounds</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label htmlFor="android-min" className="text-xs">Min Build</Label>
                    <Input
                      id="android-min"
                      type="number"
                      placeholder="e.g. 40"
                      className="text-xs font-mono"
                      {...register("minBuildNumber.android", {
                        setValueAs: (v) => (v === "" || isNaN(v) ? undefined : Number(v)),
                      })}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="android-max" className="text-xs">Max Build</Label>
                    <Input
                      id="android-max"
                      type="number"
                      placeholder="e.g. 100"
                      className="text-xs font-mono"
                      {...register("maxBuildNumber.android", {
                        setValueAs: (v) => (v === "" || isNaN(v) ? undefined : Number(v)),
                      })}
                    />
                  </div>
                </div>
              </div>

              {/* iOS Build Range */}
              <div className="space-y-3 rounded-lg border bg-muted/10 p-3">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                  <IconBrandApple className="size-4 text-zinc-600 dark:text-zinc-400" />
                  <span>iOS Build Bounds</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label htmlFor="ios-min" className="text-xs">Min Build</Label>
                    <Input
                      id="ios-min"
                      type="number"
                      placeholder="e.g. 10"
                      className="text-xs font-mono"
                      {...register("minBuildNumber.ios", {
                        setValueAs: (v) => (v === "" || isNaN(v) ? undefined : Number(v)),
                      })}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="ios-max" className="text-xs">Max Build</Label>
                    <Input
                      id="ios-max"
                      type="number"
                      placeholder="e.g. 50"
                      className="text-xs font-mono"
                      {...register("maxBuildNumber.ios", {
                        setValueAs: (v) => (v === "" || isNaN(v) ? undefined : Number(v)),
                      })}
                    />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 4. Device Whitelist & Denylist */}
        <Card className="border border-border shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Smartphone className="h-4 w-4 text-primary" />
              <CardTitle className="text-base font-semibold">
                4. Device Overrides (Whitelist & Denylist)
              </CardTitle>
            </div>
            <CardDescription className="text-xs">
              Directly include or exclude specific device IDs regardless of rollout percentage
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Allow Devices */}
            <div className="space-y-2">
              <Label htmlFor="allow-device-input">
                Always Enable for Devices (Whitelist)
              </Label>
              <div className="flex gap-2">
                <Input
                  id="allow-device-input"
                  placeholder="Enter device ID and click Add..."
                  value={deviceInput}
                  onChange={(e) => setDeviceInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      handleAddAllowDevice()
                    }
                  }}
                  className="font-mono text-xs"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAddAllowDevice}
                  className="shrink-0 gap-1"
                >
                  <Plus className="size-3.5" />
                  Add
                </Button>
              </div>
              {allowDevices.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {allowDevices.map((dev: string) => (
                    <Badge
                      key={dev}
                      variant="secondary"
                      className="gap-1 font-mono text-xs"
                    >
                      {dev}
                      <button
                        type="button"
                        onClick={() => handleRemoveAllowDevice(dev)}
                        className="cursor-pointer hover:text-destructive"
                      >
                        <X className="size-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Deny Devices */}
            <div className="space-y-2">
              <Label htmlFor="deny-device-input">
                Always Disable for Devices (Denylist)
              </Label>
              <div className="flex gap-2">
                <Input
                  id="deny-device-input"
                  placeholder="Enter device ID and click Add..."
                  value={denyDeviceInput}
                  onChange={(e) => setDeviceInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      handleAddDenyDevice()
                    }
                  }}
                  className="font-mono text-xs"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAddDenyDevice}
                  className="shrink-0 gap-1"
                >
                  <Plus className="size-3.5" />
                  Add
                </Button>
              </div>
              {denyDevices.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {denyDevices.map((dev: string) => (
                    <Badge
                      key={dev}
                      variant="destructive"
                      className="gap-1 font-mono text-xs"
                    >
                      {dev}
                      <button
                        type="button"
                        onClick={() => handleRemoveDenyDevice(dev)}
                        className="cursor-pointer hover:opacity-75"
                      >
                        <X className="size-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 5. JSON Payload Configuration */}
        <Card className="border border-border shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <FileCode2 className="h-4 w-4 text-primary" />
              <CardTitle className="text-base font-semibold">
                5. Feature Payload (JSON)
              </CardTitle>
            </div>
            <CardDescription className="text-xs">
              Optional arbitrary JSON payload parameters returned to client when flag evaluates to true
            </CardDescription>
          </CardHeader>
          <CardContent>
            <JsonEditorComponent
              id="feature-payload"
              label="Payload Object"
              value={currentPayload}
              onChange={(parsed: Record<string, unknown>) => {
                setValue("payload", parsed, { shouldValidate: true })
              }}
              error={
                errors.payload?.message
                  ? String(errors.payload.message)
                  : undefined
              }
              minHeight="200px"
            />
          </CardContent>
        </Card>

        {/* Bottom Action Bar */}
        <div className="flex w-full flex-col gap-3 pt-2 sm:flex-row">
          <Button
            type="submit"
            className="w-full flex-1 cursor-pointer sm:w-auto"
            disabled={updateMutation.isPending}
          >
            {updateMutation.isPending && <Loader />}
            Save Changes
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

export default UpdateFeature
