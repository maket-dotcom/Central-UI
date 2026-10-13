import React, { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { useForm, Controller, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  ArrowLeft,
  Package,
  Layers,
  AlertTriangle,
  Info,
  FileText,
  CheckCircle2,
  SlidersHorizontal,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
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

type UpdatePolicy = "flexible" | "selective" | "global_force"

export const UpdateRelease: React.FC = () => {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()

  const { data: releaseResp, isLoading, isError } = useGetReleaseById(id || "")
  const updateMutation = useUpdateRelease()

  const release = releaseResp?.data
  const [updatePolicy, setUpdatePolicy] = useState<UpdatePolicy>("flexible")

  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
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
      let initialPolicy: UpdatePolicy = "flexible"
      if (release.forceUpdate) {
        initialPolicy = "global_force"
      } else if (release.minBuildNumber && release.minBuildNumber > 0) {
        initialPolicy = "selective"
      }
      setUpdatePolicy(initialPolicy)

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
  const watchBuildNumber = useWatch({ control, name: "buildNumber" })
  const watchMinBuildNumber = useWatch({ control, name: "minBuildNumber" })

  const handlePolicyChange = (policy: UpdatePolicy) => {
    setUpdatePolicy(policy)
    if (policy === "flexible") {
      setValue("forceUpdate", false, { shouldValidate: true })
      setValue("minBuildNumber", undefined, { shouldValidate: true })
    } else if (policy === "selective") {
      setValue("forceUpdate", false, { shouldValidate: true })
    } else if (policy === "global_force") {
      setValue("forceUpdate", true, { shouldValidate: true })
      setValue("minBuildNumber", undefined, { shouldValidate: true })
    }
  }

  const onSubmit = (formData: PatchReleaseInputs) => {
    if (!id) return

    if (updatePolicy === "selective") {
      if (!formData.minBuildNumber || formData.minBuildNumber < 1) {
        toast.error("Please enter a valid positive integer for Minimum Required Build Threshold")
        return
      }
      const currentBuild = formData.buildNumber ?? release?.buildNumber
      if (currentBuild && formData.minBuildNumber >= currentBuild) {
        toast.error(
          `Minimum build threshold (${formData.minBuildNumber}) must be strictly less than the target release build (${currentBuild})`
        )
        return
      }
    }

    const payload: PatchReleaseInputs = {
      ...formData,
      forceUpdate: updatePolicy === "global_force",
      minBuildNumber:
        updatePolicy === "selective" ? formData.minBuildNumber : null,
    }

    updateMutation.mutate(
      {
        id,
        body: payload,
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

            {/* Update Enforcement Policy */}
            <div className="space-y-3 pt-2">
              <div className="space-y-1">
                <Label className="text-sm font-semibold">
                  Update Enforcement Policy *
                </Label>
                <p className="text-xs text-muted-foreground">
                  Determine how client devices evaluate update urgency (optional flexible prompt vs. blocking mandatory modal).
                </p>
              </div>

              {/* 3 Interactive Policy Cards */}
              <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                {/* 1. Flexible (Optional) */}
                <button
                  type="button"
                  onClick={() => handlePolicyChange("flexible")}
                  className={cn(
                    "flex flex-col items-start gap-2 rounded-lg border p-3.5 text-left transition-all cursor-pointer",
                    updatePolicy === "flexible"
                      ? "border-primary bg-primary/5 ring-1 ring-primary shadow-xs"
                      : "border-border bg-card hover:bg-muted/40"
                  )}
                >
                  <div className="flex w-full items-center justify-between">
                    <span className="flex items-center gap-1.5 font-medium text-xs">
                      <CheckCircle2 className="size-4 text-emerald-500" />
                      Flexible
                    </span>
                    <Badge variant="outline" className="text-[10px]">
                      Default
                    </Badge>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    Non-blocking update dialog ("Update Now" / "Later"). Recommended for standard feature releases.
                  </p>
                </button>

                {/* 2. Selective Cutoff */}
                <button
                  type="button"
                  onClick={() => handlePolicyChange("selective")}
                  className={cn(
                    "flex flex-col items-start gap-2 rounded-lg border p-3.5 text-left transition-all cursor-pointer",
                    updatePolicy === "selective"
                      ? "border-amber-500 bg-amber-500/5 ring-1 ring-amber-500 shadow-xs"
                      : "border-border bg-card hover:bg-muted/40"
                  )}
                >
                  <div className="flex w-full items-center justify-between">
                    <span className="flex items-center gap-1.5 font-medium text-xs">
                      <SlidersHorizontal className="size-4 text-amber-500" />
                      Selective Cutoff
                    </span>
                    <Badge
                      variant="outline"
                      className="border-amber-500/40 text-[10px] text-amber-600 dark:text-amber-400"
                    >
                      Threshold
                    </Badge>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    Mandatory only for older builds strictly below a cutoff. Builds on or above cutoff receive a flexible prompt.
                  </p>
                </button>

                {/* 3. Global Mandatory */}
                <button
                  type="button"
                  onClick={() => handlePolicyChange("global_force")}
                  className={cn(
                    "flex flex-col items-start gap-2 rounded-lg border p-3.5 text-left transition-all cursor-pointer",
                    updatePolicy === "global_force"
                      ? "border-destructive bg-destructive/5 ring-1 ring-destructive shadow-xs"
                      : "border-border bg-card hover:bg-muted/40"
                  )}
                >
                  <div className="flex w-full items-center justify-between">
                    <span className="flex items-center gap-1.5 font-medium text-xs">
                      <AlertTriangle className="size-4 text-destructive" />
                      Global Mandatory
                    </span>
                    <Badge variant="destructive" className="text-[10px]">
                      Force All
                    </Badge>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    Blocks 100% of older builds immediately with an impassable upgrade screen. For breaking API changes or CVEs.
                  </p>
                </button>
              </div>

              {/* Policy Context Details / Inputs */}
              {updatePolicy === "selective" && (
                <div className="space-y-3 rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-600 dark:text-amber-400">
                    <Info className="size-4" />
                    <span>Minimum Required Build Threshold (minBuildNumber)</span>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="minBuildNumber" className="text-xs font-medium">
                      Minimum Supported Build Integer *
                    </Label>
                    <Input
                      id="minBuildNumber"
                      type="number"
                      min={1}
                      placeholder="e.g. 3 (devices strictly less than 3 are forced to update)"
                      {...register("minBuildNumber", {
                        setValueAs: (v) =>
                          v === "" || isNaN(v) ? undefined : Number(v),
                      })}
                    />
                    {errors.minBuildNumber && (
                      <p className="text-xs text-destructive">
                        {errors.minBuildNumber.message}
                      </p>
                    )}
                  </div>

                  {/* Dynamic Simulation Preview */}
                  <div className="space-y-1.5 rounded-md border border-border/60 bg-background/80 p-3 text-[11px]">
                    <div className="flex items-center justify-between font-semibold text-foreground">
                      <span>Live Client Behavior Simulation</span>
                      <span className="font-mono text-[10px] text-muted-foreground">
                        Target Build: #{watchBuildNumber ?? release?.buildNumber ?? "?"}
                      </span>
                    </div>
                    {watchMinBuildNumber && watchMinBuildNumber > 0 ? (
                      <div className="space-y-2">
                        {(watchBuildNumber ?? release?.buildNumber) &&
                          watchMinBuildNumber >=
                            (watchBuildNumber ?? release?.buildNumber)! && (
                            <div className="rounded border border-destructive/30 bg-destructive/10 p-2 text-[10px] text-destructive font-medium">
                              ⚠️ <strong>Invalid Threshold:</strong> Minimum build cutoff ({watchMinBuildNumber}) must be strictly less than target release build (#{watchBuildNumber ?? release?.buildNumber}).
                            </div>
                          )}
                        {watchMinBuildNumber === 1 && (
                          <div className="rounded border border-amber-500/30 bg-amber-500/10 p-2 text-[10px] text-amber-700 dark:text-amber-300">
                            💡 <strong>Note on build #1:</strong> Since mobile app builds start at integer 1, setting threshold to 1 means <strong>no builds are forced</strong> (all older builds receive optional updates). If you want build #1 to be forced, set this threshold to <strong>2</strong>.
                          </div>
                        )}
                        <ul className="space-y-1 text-muted-foreground">
                          <li className="flex items-center gap-2">
                            <span className="inline-block size-2 shrink-0 rounded-full bg-destructive" />
                            <span>
                              Builds <strong>&lt; {watchMinBuildNumber}</strong>{" "}
                              {watchMinBuildNumber > 1
                                ? `(e.g. #${watchMinBuildNumber - 1})`
                                : ""}
                              : Receive{" "}
                              <code className="font-mono font-bold text-destructive">
                                updateType: "force"
                              </code>{" "}
                              (blocking modal).
                            </span>
                          </li>
                        <li className="flex items-center gap-2">
                          <span className="inline-block size-2 shrink-0 rounded-full bg-emerald-500" />
                          <span>
                            Builds <strong>&gt;= {watchMinBuildNumber}</strong>{" "}
                            up to{" "}
                            <strong>
                              #{((watchBuildNumber ?? release?.buildNumber) ? (watchBuildNumber ?? release?.buildNumber)! - 1 : 0) >= watchMinBuildNumber
                                ? (watchBuildNumber ?? release?.buildNumber)! - 1
                                : watchMinBuildNumber}
                            </strong>
                            : Receive{" "}
                            <code className="font-mono font-bold text-primary">
                              updateType: "optional"
                            </code>{" "}
                            (flexible banner).
                          </span>
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="inline-block size-2 shrink-0 rounded-full bg-muted-foreground" />
                          <span>
                            Build <strong>#{watchBuildNumber ?? release?.buildNumber ?? "?"}</strong>: Up to date (
                            <code className="font-mono">updateType: "none"</code>
                            ).
                          </span>
                        </li>
                      </ul>
                    </div>
                  ) : (
                      <p className="italic text-muted-foreground">
                        Enter a minimum build integer above to preview which client builds are forced and which receive optional prompts.
                      </p>
                    )}
                  </div>
                </div>
              )}

              {updatePolicy === "global_force" && (
                <div className="flex items-start gap-2.5 rounded-lg border border-destructive/20 bg-destructive/5 p-3 text-xs">
                  <AlertTriangle className="mt-0.5 size-4 shrink-0 text-destructive" />
                  <div className="space-y-0.5">
                    <span className="font-semibold text-destructive">
                      Blanket Mandatory Upgrade Active
                    </span>
                    <p className="text-[11px] text-muted-foreground">
                      All clients with build number strictly less than #{watchBuildNumber ?? release?.buildNumber ?? "?"} will receive{" "}
                      <code className="font-mono font-bold text-destructive">
                        updateType: "force"
                      </code>
                      . The keyboard interface will be blocked until the update is installed.
                    </p>
                  </div>
                </div>
              )}

              {updatePolicy === "flexible" && (
                <div className="flex items-center gap-2 rounded-lg border border-border/60 bg-muted/20 p-2.5 text-[11px] text-muted-foreground">
                  <CheckCircle2 className="size-3.5 shrink-0 text-emerald-500" />
                  <span>
                    Clients below #{watchBuildNumber ?? release?.buildNumber ?? "?"} will receive a dismissible update prompt (
                    <code className="font-mono text-primary">updateType: "optional"</code>
                    ).
                  </span>
                </div>
              )}
            </div>
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
