import React, { useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { useForm, Controller, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { ArrowLeft, Package, Layers, AlertTriangle, Info, FileText } from "lucide-react"
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
import SelectComponent from "@/components/inputComponents/select-component"
import Loader from "@/components/loader"
import { toast } from "sonner"
import { getFirstFormErrorMessage } from "@/utils/formUtils"
import {
  patchReleaseSchema,
  type PatchReleaseInputs,
} from "@/utils/schemas/keyboard/releaseSchema"
import { useGetReleaseById, useUpdateRelease } from "@/query/keyboard/useRelease"

export const UpdateRelease: React.FC = () => {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()

  const { data: releaseResp, isLoading, isError } = useGetReleaseById(id || "")
  const updateMutation = useUpdateRelease()

  const release = releaseResp?.data

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<PatchReleaseInputs>({
    resolver: zodResolver(patchReleaseSchema),
    defaultValues: {
      channel: "internal",
      buildNumber: 1,
      downloadUrl: "",
      changelog: "",
      forceUpdate: false,
      rolloutPercentage: 100,
      status: "draft",
    },
  })

  // Hydrate form once data arrives
  useEffect(() => {
    if (release) {
      reset({
        channel: release.channel,
        buildNumber: release.buildNumber,
        downloadUrl: release.downloadUrl,
        changelog: release.changelog || "",
        minBuildNumber: release.minBuildNumber,
        forceUpdate: release.forceUpdate,
        rolloutPercentage: release.rolloutPercentage,
        status: release.status,
      })
    }
  }, [release, reset])

  const currentRollout = useWatch({ control, name: "rolloutPercentage" })
  const isForceUpdate = useWatch({ control, name: "forceUpdate" })

  const onSubmit = (formData: PatchReleaseInputs) => {
    if (!id) return

    updateMutation.mutate(
      {
        id,
        body: formData,
      },
      {
        onSuccess: () => {
          navigate("/keyboard/releases/list")
        },
      }
    )
  }

  const handleCancel = () => {
    navigate("/keyboard/releases/list")
  }

  if (isLoading) {
    return (
      <div className="flex min-h-100 flex-col items-center justify-center gap-3 p-8 text-center">
        <Loader size={32} />
        <p className="text-sm text-muted-foreground">
          Loading release details...
        </p>
      </div>
    )
  }

  if (isError || !release) {
    return (
      <div className="flex flex-1 flex-col gap-6 w-full">
        <div className="overflow-hidden rounded-xl border border-destructive/30 bg-destructive/10 p-8 text-center">
          <h2 className="text-base font-semibold text-destructive">
            Release Build Not Found
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            The requested release record could not be found or has been removed.
          </p>
          <Button
            onClick={handleCancel}
            variant="outline"
            size="sm"
            className="mt-4 cursor-pointer"
          >
            Back to Releases
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
          aria-label="Back to releases"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex cursor-default flex-col gap-1 text-left">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight">
              Edit Release Build
            </h1>
            <Badge variant="outline" className="font-mono text-xs">
              v{release.version} (#{release.buildNumber})
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Update rollout percentage, target channels, or emergency force-update status
          </p>
        </div>
      </div>

      <form
        id="update-release-form"
        onSubmit={handleSubmit(onSubmit, (formErrors) => {
          const errorMsg = getFirstFormErrorMessage(formErrors)
          if (errorMsg) {
            toast.error(errorMsg)
          }
        })}
        className="flex flex-col gap-6"
      >
        {/* 1. Target Binary & Channel */}
        <Card className="border border-border shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-primary" />
              <CardTitle className="text-base font-semibold">
                1. Target Binary & Channel
              </CardTitle>
            </div>
            <CardDescription className="text-xs">
              Platform identity, release distribution channel, and binary locator
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* Platform (Read-Only) */}
              <div className="space-y-2">
                <Label>Platform</Label>
                <div className="flex h-10 w-full items-center rounded-md border border-input bg-muted px-3 text-sm capitalize text-muted-foreground">
                  {release.platform}
                </div>
                <p className="text-xs text-muted-foreground">
                  Release platform cannot be modified after registration.
                </p>
              </div>

              {/* Version (Read-Only) */}
              <div className="space-y-2">
                <Label>Version String</Label>
                <div className="flex h-10 w-full items-center rounded-md border border-input bg-muted px-3 font-mono text-sm text-muted-foreground">
                  v{release.version}
                </div>
                <p className="text-xs text-muted-foreground">
                  Version string is immutable to protect client upgrade paths.
                </p>
              </div>

              {/* Channel */}
              <div className="space-y-2">
                <Label htmlFor="channel">Channel *</Label>
                <Controller
                  name="channel"
                  control={control}
                  render={({ field }) => (
                    <SelectComponent
                      id="channel"
                      value={field.value}
                      onValueChange={field.onChange}
                      placeholder="Select channel"
                      data={[
                        { name: "Internal (QA & Staff)", value: "internal" },
                        { name: "Beta (Public Testers)", value: "beta" },
                        { name: "Production", value: "production" },
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

              {/* Build Number */}
              <div className="space-y-2">
                <Label htmlFor="buildNumber">Build Number *</Label>
                <Input
                  id="buildNumber"
                  type="number"
                  min={1}
                  {...register("buildNumber", { valueAsNumber: true })}
                />
                {errors.buildNumber && (
                  <p className="text-xs text-destructive">
                    {errors.buildNumber.message}
                  </p>
                )}
              </div>

              {/* Download URL */}
              <div className="col-span-1 space-y-2 sm:col-span-2">
                <Label htmlFor="downloadUrl">Download / Store URL</Label>
                <Input
                  id="downloadUrl"
                  placeholder="https://play.google.com/store/apps/details?id=... or direct APK URL"
                  {...register("downloadUrl")}
                />
                {errors.downloadUrl && (
                  <p className="text-xs text-destructive">
                    {errors.downloadUrl.message}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 2. Rollout Rules & Version Constraints */}
        <Card className="border border-border shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-primary" />
              <CardTitle className="text-base font-semibold">
                2. Rollout Rules & Version Constraints
              </CardTitle>
            </div>
            <CardDescription className="text-xs">
              Publication state, staged rollout percentage, and in-app update enforcement
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* Publication Status */}
              <div className="space-y-2">
                <Label htmlFor="status">Publication Status *</Label>
                <Controller
                  name="status"
                  control={control}
                  render={({ field }) => (
                    <SelectComponent
                      id="status"
                      value={field.value}
                      onValueChange={field.onChange}
                      placeholder="Select status"
                      data={[
                        { name: "Draft (Unpublished)", value: "draft" },
                        { name: "Active (Serving updates)", value: "active" },
                        { name: "Paused (Temporarily halted)", value: "paused" },
                        { name: "Archived", value: "archived" },
                      ]}
                      className="w-full"
                    />
                  )}
                />
                {errors.status && (
                  <p className="text-xs text-destructive">
                    {errors.status.message}
                  </p>
                )}
              </div>

              {/* Rollout Percentage Slider / Input */}
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

            {/* Force Update Switch */}
            <div className="flex items-start justify-between rounded-lg border bg-muted/20 p-4">
              <div className="space-y-0.5 pr-4">
                <div className="flex items-center gap-1.5 font-medium text-sm">
                  <AlertTriangle className="size-4 text-amber-500" />
                  <span>Force Immediate Update</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  When enabled, client devices below the threshold will receive mandatory update prompts blocking normal usage.
                </p>
              </div>
              <Controller
                name="forceUpdate"
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

            {/* Min Build Number (conditional) */}
            {isForceUpdate && (
              <div className="space-y-2 rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
                <div className="flex items-center gap-1.5 text-xs font-medium text-amber-600 dark:text-amber-400">
                  <Info className="size-3.5" />
                  <span>Minimum Required Build Threshold</span>
                </div>
                <Input
                  id="minBuildNumber"
                  type="number"
                  min={1}
                  placeholder="e.g. 35 (builds strictly less than this are forced to update)"
                  {...register("minBuildNumber", {
                    setValueAs: (v) => (v === "" || isNaN(v) ? undefined : Number(v)),
                  })}
                />
                {errors.minBuildNumber && (
                  <p className="text-xs text-destructive">
                    {errors.minBuildNumber.message}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  Devices with buildNumber &lt; minBuildNumber are forced to update. If blank, all builds below this build will update.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 3. Release Notes / Changelog */}
        <Card className="border border-border shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              <CardTitle className="text-base font-semibold">
                3. Release Notes / Changelog
              </CardTitle>
            </div>
            <CardDescription className="text-xs">
              User-facing release highlights shown in app update prompts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              id="changelog"
              placeholder="- Added AI sticker generator&#10;- Fixed keyboard layout lag&#10;- Performance improvements"
              rows={5}
              className="font-sans text-xs"
              {...register("changelog")}
            />
            {errors.changelog && (
              <p className="mt-1 text-xs text-destructive">
                {errors.changelog.message}
              </p>
            )}
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

export default UpdateRelease
