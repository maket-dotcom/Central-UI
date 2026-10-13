import React, { useState, useEffect } from "react"
import { useForm, Controller, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  ArrowLeft,
  Flag,
  Layers,
  Smartphone,
  FileCode2,
  Sliders,
  Sparkles,
  AlertTriangle,
} from "lucide-react"
import { IconBrandAndroid, IconBrandApple } from "@tabler/icons-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { cn } from "cn"
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
  createFeatureSchema,
  type CreateFeatureInputs,
  type FeaturePlatform,
  type FeatureChannel,
} from "@/utils/schemas/keyboard/featureSchema"
import { HelpButton, HelpTip } from "@/components/helpTour"
import { FeatureHelpDrawer } from "./feature-help-drawer"
import { FeatureDeviceTagInput } from "./feature-device-tag-input"
import { FeatureSimulatorCard } from "./feature-simulator-card"

const PLATFORMS: {
  value: FeaturePlatform
  label: string
  icon: React.ReactNode
}[] = [
  {
    value: "android",
    label: "Android",
    icon: (
      <IconBrandAndroid className="size-3.5 text-emerald-600 dark:text-emerald-400" />
    ),
  },
  {
    value: "ios",
    label: "iOS",
    icon: (
      <IconBrandApple className="size-3.5 text-zinc-600 dark:text-zinc-400" />
    ),
  },
]

const CHANNELS: { value: FeatureChannel; label: string }[] = [
  { value: "internal", label: "Internal (QA)" },
  { value: "beta", label: "Beta" },
  { value: "production", label: "Production" },
]

interface FeatureFormProps {
  initialValues?: Partial<CreateFeatureInputs>
  isEditing?: boolean
  featureKey?: string
  onSubmit: (formData: CreateFeatureInputs) => void
  isPending: boolean
  onCancel: () => void
}

export const FeatureForm: React.FC<FeatureFormProps> = ({
  initialValues,
  isEditing = false,
  featureKey,
  onSubmit,
  isPending,
  onCancel,
}) => {
  const [helpOpen, setHelpOpen] = useState(false)
  const [activeHelpTopicId, setActiveHelpTopicId] = useState<
    string | undefined
  >()

  const openHelpTo = (topicId: string) => {
    setActiveHelpTopicId(topicId)
    setHelpOpen(true)
  }

  const {
    register,
    handleSubmit,
    control,
    setValue,
    reset,
    formState: { errors },
  } = useForm<CreateFeatureInputs>({
    resolver: zodResolver(createFeatureSchema),
    defaultValues: {
      key: featureKey || "",
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
      ...initialValues,
    },
  })

  // Hydrate initial values when editing
  useEffect(() => {
    if (initialValues) {
      reset({
        key: featureKey || initialValues.key || "",
        description: initialValues.description || "",
        enabled: initialValues.enabled ?? false,
        platforms: initialValues.platforms || ["android", "ios"],
        channels: initialValues.channels || ["internal", "beta", "production"],
        rolloutPercentage: initialValues.rolloutPercentage ?? 100,
        minBuildNumber: initialValues.minBuildNumber || {},
        maxBuildNumber: initialValues.maxBuildNumber || {},
        allowDevices: initialValues.allowDevices || [],
        denyDevices: initialValues.denyDevices || [],
        payload: initialValues.payload || {},
      })
    }
  }, [initialValues, featureKey, reset])

  const currentKey = useWatch({ control, name: "key" })
  const currentEnabled = useWatch({ control, name: "enabled" })
  const currentPlatforms = useWatch({ control, name: "platforms" }) || []
  const currentChannels = useWatch({ control, name: "channels" }) || []
  const currentRollout = useWatch({ control, name: "rolloutPercentage" }) ?? 100
  const allowDevices = useWatch({ control, name: "allowDevices" }) || []
  const denyDevices = useWatch({ control, name: "denyDevices" }) || []
  const currentMinBuild = useWatch({ control, name: "minBuildNumber" }) || {}
  const currentMaxBuild = useWatch({ control, name: "maxBuildNumber" }) || {}
  const currentPayload = useWatch({ control, name: "payload" }) || {}

  // Warning when reducing rollout percentage
  const savedRollout = initialValues?.rolloutPercentage
  const isDialingDownRollout =
    isEditing && savedRollout !== undefined && currentRollout < savedRollout

  // Playbook Preset Quick-Selectors
  const handleApplyPreset = (
    preset: "dogfooding" | "canary" | "android" | "versionGate" | "betaRing"
  ) => {
    switch (preset) {
      case "dogfooding":
        setValue("enabled", true)
        setValue("rolloutPercentage", 0)
        setValue("channels", ["internal", "beta", "production"])
        toast.info(
          "Applied Dogfooding preset: 0% Rollout. Add your device to Allow List below!"
        )
        break
      case "canary":
        setValue("enabled", true)
        setValue("rolloutPercentage", 10)
        setValue("channels", ["production"])
        setValue("allowDevices", [])
        toast.info("Applied 10% Canary Stage 1 preset.")
        break
      case "android":
        setValue("enabled", true)
        setValue("platforms", ["android"])
        setValue("rolloutPercentage", 100)
        toast.info("Applied Android-Exclusive preset.")
        break
      case "versionGate":
        setValue("enabled", true)
        setValue("rolloutPercentage", 100)
        setValue("minBuildNumber", { android: 2 })
        toast.info("Applied Native Version Gate preset (Android Min Build: 2).")
        break
      case "betaRing":
        setValue("enabled", true)
        setValue("channels", ["internal", "beta"])
        setValue("rolloutPercentage", 100)
        setValue("allowDevices", [])
        toast.info("Applied Beta Tester Ring preset (allowDevices kept empty).")
        break
    }
  }

  return (
    <div className="flex w-full flex-1 flex-col gap-6">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onCancel}
            aria-label="Back to feature flags"
          >
            <ArrowLeft className="size-4" />
          </Button>
          <div className="flex flex-col gap-0.5 text-left">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight">
                {isEditing ? `Edit Flag: ${featureKey}` : "New Feature Flag"}
              </h1>
              {isEditing && (
                <Badge variant={currentEnabled ? "default" : "secondary"}>
                  {currentEnabled ? "Active" : "Disabled"}
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Define 7-gate targeting rules, rollout percentages, and runtime
              payloads
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <HelpButton
            onClick={() => setHelpOpen(true)}
            label="7-Gate Operations Guide"
            badge="Playbooks"
          />
        </div>
      </div>

      {/* Playbook Quick-Start Assistant Bar (For new flags or quick re-target) */}
      {!isEditing && (
        <div className="space-y-2.5 rounded-xl border border-primary/20 bg-primary/5 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
              <Sparkles className="size-3.5 text-primary" />
              <span>
                Playbook Quick-Start Presets (Click to pre-fill standard setup):
              </span>
            </div>
            <span className="text-[11px] text-muted-foreground">
              Saves time & prevents misconfigurations
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs sm:grid-cols-3 lg:grid-cols-5">
            <button
              type="button"
              onClick={() => handleApplyPreset("dogfooding")}
              className="cursor-pointer rounded-lg border border-border bg-background p-2 text-left transition-all hover:border-primary hover:bg-muted"
            >
              <div className="flex items-center gap-1 text-[11px] font-bold">
                <span>🧪 1. Dogfooding</span>
              </div>
              <p className="mt-0.5 line-clamp-1 text-[10px] text-muted-foreground">
                0% Rollout + VIP Allow List
              </p>
            </button>

            <button
              type="button"
              onClick={() => handleApplyPreset("canary")}
              className="cursor-pointer rounded-lg border border-border bg-background p-2 text-left transition-all hover:border-primary hover:bg-muted"
            >
              <div className="flex items-center gap-1 text-[11px] font-bold">
                <span>🚀 2. Canary 10%</span>
              </div>
              <p className="mt-0.5 line-clamp-1 text-[10px] text-muted-foreground">
                Stage 1 safe phased release
              </p>
            </button>

            <button
              type="button"
              onClick={() => handleApplyPreset("android")}
              className="cursor-pointer rounded-lg border border-border bg-background p-2 text-left transition-all hover:border-primary hover:bg-muted"
            >
              <div className="flex items-center gap-1 text-[11px] font-bold">
                <span>📱 3. Android Only</span>
              </div>
              <p className="mt-0.5 line-clamp-1 text-[10px] text-muted-foreground">
                OS isolated 100% rollout
              </p>
            </button>

            <button
              type="button"
              onClick={() => handleApplyPreset("versionGate")}
              className="cursor-pointer rounded-lg border border-border bg-background p-2 text-left transition-all hover:border-primary hover:bg-muted"
            >
              <div className="flex items-center gap-1 text-[11px] font-bold">
                <span>🛡️ 4. Version Gate</span>
              </div>
              <p className="mt-0.5 line-clamp-1 text-[10px] text-muted-foreground">
                Min Build Number requirement
              </p>
            </button>

            <button
              type="button"
              onClick={() => handleApplyPreset("betaRing")}
              className="cursor-pointer rounded-lg border border-border bg-background p-2 text-left transition-all hover:border-primary hover:bg-muted"
            >
              <div className="flex items-center gap-1 text-[11px] font-bold">
                <span>👥 5. Beta Ring</span>
              </div>
              <p className="mt-0.5 line-clamp-1 text-[10px] text-muted-foreground">
                Internal + Beta release rings
              </p>
            </button>
          </div>
        </div>
      )}

      {/* Main Form */}
      <form
        onSubmit={handleSubmit(onSubmit, (formErrors) => {
          const errorMsg = getFirstFormErrorMessage(formErrors)
          if (errorMsg) toast.error(errorMsg)
        })}
        className="flex flex-col gap-6"
      >
        {/* 1. Identity & Master State (Gate 1) */}
        <Card className="border border-border shadow-xs">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Flag className="size-4 text-primary" />
                <CardTitle className="text-sm font-semibold">
                  1. Feature Identity & Master Switch (Gate 1)
                </CardTitle>
              </div>
              <HelpTip
                content="Gate 1 is the Master Kill-Switch. If OFF, the feature is immediately forced to enabled: false for 100% of devices worldwide, bypassing all other rules."
                onLearnMore={() => openHelpTo("seven-gate-pipeline")}
              />
            </div>
            <CardDescription className="text-xs">
              Unique programmatic identifier, human description, and master
              killswitch
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* Feature Key */}
              <div className="space-y-2">
                <Label htmlFor="key" className="text-xs font-semibold">
                  Feature Key *
                </Label>
                <Input
                  id="key"
                  placeholder="e.g. ai_smart_reply, giphy, sticker_tab"
                  disabled={isEditing}
                  className="font-mono text-xs"
                  {...register("key")}
                />
                {errors.key && (
                  <p className="text-xs text-destructive">
                    {errors.key.message}
                  </p>
                )}
                <p className="text-[11px] text-muted-foreground">
                  Lower snake_case identifier queried by mobile IME clients.
                  Immutable after creation.
                </p>
              </div>

              {/* Master Switch */}
              <div className="flex items-center justify-between rounded-lg border bg-muted/20 p-4">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
                    <span>Master Kill-Switch</span>
                    {currentEnabled ? (
                      <Badge variant="default" className="text-[10px]">
                        ON
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="text-[10px]">
                        OFF
                      </Badge>
                    )}
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    If toggled OFF, flag evaluates to{" "}
                    <code className="font-mono">
                      &#123; "enabled": false &#125;
                    </code>{" "}
                    globally.
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
              <Label htmlFor="description" className="text-xs font-semibold">
                Description
              </Label>
              <Textarea
                id="description"
                placeholder="Explain what functionality this feature flag gates across Android & iOS..."
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

        {/* 2. Rollout & Phased Canary Engine (Gate 7) */}
        <Card className="border border-border shadow-xs">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="size-4 text-primary" />
                <CardTitle className="text-sm font-semibold">
                  2. Rollout Percentage & Canary Engine (Gate 7)
                </CardTitle>
              </div>
              <HelpTip
                content="Deterministic FNV-1a hashing guarantees monotonicity: expanding rollout (10% to 25%) never drops existing users. Dialing down revokes access."
                onLearnMore={() => openHelpTo("canary-rollouts")}
              />
            </div>
            <CardDescription className="text-xs">
              Gradual progressive delivery based on deterministic FNV-1a device
              bucketing
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label
                  htmlFor="rolloutPercentage"
                  className="text-xs font-semibold"
                >
                  Rollout Percentage (0% to 100%)
                </Label>
                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className="font-mono text-xs font-bold text-primary"
                  >
                    {currentRollout}% Rollout
                  </Badge>
                  {currentRollout === 100 && (
                    <Badge variant="default" className="text-[10px]">
                      General Availability (GA)
                    </Badge>
                  )}
                  {currentRollout === 0 && (
                    <Badge variant="secondary" className="text-[10px]">
                      0% (VIP Whitelist Only)
                    </Badge>
                  )}
                </div>
              </div>

              <Controller
                name="rolloutPercentage"
                control={control}
                render={({ field }) => (
                  <div className="space-y-3 pt-1">
                    <div className="flex items-center gap-4">
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

                    {/* Quick Stage Jump Buttons */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <span className="mr-1 text-[11px] font-semibold text-muted-foreground">
                        Presets:
                      </span>
                      <ToggleGroup
                        value={[String(field.value)]}
                        onValueChange={(val) => {
                          if (val && val.length > 0) {
                            field.onChange(Number(val[val.length - 1]))
                          }
                        }}
                        variant="outline"
                        size="sm"
                        className="flex flex-wrap gap-1.5"
                      >
                        {[
                          { label: "0% (QA Only)", val: 0 },
                          { label: "10% (Canary)", val: 10 },
                          { label: "25% (Early)", val: 25 },
                          { label: "50% (Majority)", val: 50 },
                          { label: "100% (GA)", val: 100 },
                        ].map((item) => (
                          <ToggleGroupItem
                            key={item.val}
                            value={String(item.val)}
                            className="h-7 cursor-pointer px-2 text-[11px] font-medium"
                          >
                            {item.label}
                          </ToggleGroupItem>
                        ))}
                      </ToggleGroup>
                    </div>
                  </div>
                )}
              />

              {errors.rolloutPercentage && (
                <p className="text-xs text-destructive">
                  {errors.rolloutPercentage.message}
                </p>
              )}

              {/* Warning when dialing down */}
              {isDialingDownRollout && (
                <Alert
                  variant="destructive"
                  className="border-amber-500/30 bg-amber-500/10 text-amber-950 dark:text-amber-200"
                >
                  <AlertTriangle className="size-4 text-amber-600 dark:text-amber-400" />
                  <AlertTitle className="font-bold">
                    Rollback Warning: Decreasing Rollout
                  </AlertTitle>
                  <AlertDescription className="text-[11px] text-amber-950/90 dark:text-amber-200/90">
                    Dialing down from {savedRollout}% to {currentRollout}% will
                    immediately deactivate this feature for active users
                    currently bucketed in buckets {currentRollout}–
                    {savedRollout}%. Only dial down for emergency rollbacks.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 3. Platform & Channel Targeting (Gates 4 & 5) */}
        <Card className="border border-border shadow-xs">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sliders className="size-4 text-primary" />
                <CardTitle className="text-sm font-semibold">
                  3. Platform & Release Ring Targeting (Gates 4 & 5)
                </CardTitle>
              </div>
              <HelpTip
                content="Select which OS platforms and distribution channels receive the flag. Note: allowDevices will bypass these checks!"
                onLearnMore={() => openHelpTo("vip-bypass-case-study")}
              />
            </div>
            <CardDescription className="text-xs">
              Restrict feature availability to specific operating systems and
              release rings
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* Platforms (Gate 4) */}
              <div className="space-y-2">
                <Label className="text-xs font-semibold">
                  Target Operating Systems (Gate 4) *
                </Label>
                <ToggleGroup
                  multiple
                  value={currentPlatforms}
                  onValueChange={(val) => {
                    setValue("platforms", (val || []) as FeaturePlatform[], {
                      shouldValidate: true,
                    })
                  }}
                  variant="outline"
                  className="flex flex-wrap gap-2"
                >
                  {PLATFORMS.map((plat) => {
                    const isSelected = currentPlatforms.includes(plat.value)
                    return (
                      <ToggleGroupItem
                        key={plat.value}
                        value={plat.value}
                        className={cn(
                          "inline-flex cursor-pointer items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium transition-all",
                          isSelected
                            ? "border-primary bg-primary/10 font-semibold text-primary shadow-xs"
                            : "border-border text-muted-foreground hover:bg-muted hover:text-foreground"
                        )}
                      >
                        {plat.icon}
                        <span>{plat.label}</span>
                        {isSelected && (
                          <span className="size-1.5 shrink-0 rounded-full bg-primary" />
                        )}
                      </ToggleGroupItem>
                    )
                  })}
                </ToggleGroup>
                <p className="text-[11px] text-muted-foreground">
                  Selecting both Android and iOS targets all mobile devices
                  worldwide.
                </p>
                {errors.platforms && (
                  <p className="text-xs text-destructive">
                    {errors.platforms.message}
                  </p>
                )}
              </div>

              {/* Channels (Gate 5) */}
              <div className="space-y-2">
                <Label className="text-xs font-semibold">
                  Distribution Release Rings (Gate 5) *
                </Label>
                <ToggleGroup
                  multiple
                  value={currentChannels}
                  onValueChange={(val) => {
                    setValue("channels", (val || []) as FeatureChannel[], {
                      shouldValidate: true,
                    })
                  }}
                  variant="outline"
                  className="flex flex-wrap gap-2"
                >
                  {CHANNELS.map((ch) => {
                    const isSelected = currentChannels.includes(ch.value)
                    return (
                      <ToggleGroupItem
                        key={ch.value}
                        value={ch.value}
                        className={cn(
                          "inline-flex cursor-pointer items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium transition-all",
                          isSelected
                            ? "border-primary bg-primary/10 font-semibold text-primary shadow-xs"
                            : "border-border text-muted-foreground hover:bg-muted hover:text-foreground"
                        )}
                      >
                        <span>{ch.label}</span>
                        {isSelected && (
                          <span className="size-1.5 shrink-0 rounded-full bg-primary" />
                        )}
                      </ToggleGroupItem>
                    )
                  })}
                </ToggleGroup>
                <p className="text-[11px] text-muted-foreground">
                  Clients sending matching{" "}
                  <code className="font-mono">X-Channel</code> pass Gate 5.
                </p>
                {errors.channels && (
                  <p className="text-xs text-destructive">
                    {errors.channels.message}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 4. Build Number Bounds (Gate 6) */}
        <Card className="border border-border shadow-xs">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="size-4 text-primary" />
                <CardTitle className="text-sm font-semibold">
                  4. Native App Build Bounds (Gate 6)
                </CardTitle>
              </div>
              <HelpTip
                content="Use Min Build when new compiled C++/IME code exists only in recent APK builds. Never set higher than current live Play Store APK!"
                onLearnMore={() => openHelpTo("seven-gate-pipeline")}
              />
            </div>
            <CardDescription className="text-xs">
              Exclude older or legacy APK builds that do not have the native
              client implementation
            </CardDescription>
          </CardHeader>

          <CardContent>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* Android Bounds */}
              <div className="space-y-3 rounded-lg border border-border/80 bg-muted/10 p-3.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                  <IconBrandAndroid className="size-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Android Build Bounds</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label htmlFor="android-min" className="text-[11px]">
                      Min Build
                    </Label>
                    <Input
                      id="android-min"
                      type="number"
                      placeholder="e.g. 2"
                      className="font-mono text-xs"
                      {...register("minBuildNumber.android", {
                        setValueAs: (v) =>
                          v === "" || isNaN(v) ? undefined : Number(v),
                      })}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="android-max" className="text-[11px]">
                      Max Build
                    </Label>
                    <Input
                      id="android-max"
                      type="number"
                      placeholder="e.g. 100"
                      className="font-mono text-xs"
                      {...register("maxBuildNumber.android", {
                        setValueAs: (v) =>
                          v === "" || isNaN(v) ? undefined : Number(v),
                      })}
                    />
                  </div>
                  {errors.minBuildNumber?.android && (
                    <p className="col-span-2 text-[10px] text-destructive">
                      {errors.minBuildNumber.android.message}
                    </p>
                  )}
                  {currentMinBuild.android != null &&
                    currentMaxBuild.android != null &&
                    currentMinBuild.android > currentMaxBuild.android && (
                      <p className="col-span-2 text-[10px] text-destructive font-medium">
                        ⚠️ Min Build ({currentMinBuild.android}) cannot exceed Max Build ({currentMaxBuild.android}).
                      </p>
                    )}
                </div>
              </div>

              {/* iOS Bounds */}
              <div className="space-y-3 rounded-lg border border-border/80 bg-muted/10 p-3.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                  <IconBrandApple className="size-4 text-zinc-600 dark:text-zinc-400" />
                  <span>iOS Build Bounds</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label htmlFor="ios-min" className="text-[11px]">
                      Min Build
                    </Label>
                    <Input
                      id="ios-min"
                      type="number"
                      placeholder="e.g. 1"
                      className="font-mono text-xs"
                      {...register("minBuildNumber.ios", {
                        setValueAs: (v) =>
                          v === "" || isNaN(v) ? undefined : Number(v),
                      })}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="ios-max" className="text-[11px]">
                      Max Build
                    </Label>
                    <Input
                      id="ios-max"
                      type="number"
                      placeholder="e.g. 50"
                      className="font-mono text-xs"
                      {...register("maxBuildNumber.ios", {
                        setValueAs: (v) =>
                          v === "" || isNaN(v) ? undefined : Number(v),
                      })}
                    />
                  </div>
                  {errors.minBuildNumber?.ios && (
                    <p className="col-span-2 text-[10px] text-destructive">
                      {errors.minBuildNumber.ios.message}
                    </p>
                  )}
                  {currentMinBuild.ios != null &&
                    currentMaxBuild.ios != null &&
                    currentMinBuild.ios > currentMaxBuild.ios && (
                      <p className="col-span-2 text-[10px] text-destructive font-medium">
                        ⚠️ Min Build ({currentMinBuild.ios}) cannot exceed Max Build ({currentMaxBuild.ios}).
                      </p>
                    )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 5. Device Overrides (Gates 2 & 3) */}
        <Card className="border border-border shadow-xs">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Smartphone className="size-4 text-primary" />
                <CardTitle className="text-sm font-semibold">
                  5. Device Overrides (Gates 2 & 3)
                </CardTitle>
              </div>
              <HelpTip
                content="Gate 2 (Deny List) overrules everything. Gate 3 (Allow List) is a VIP bypass that skips Platform, Channel, Build & Rollout checks."
                onLearnMore={() => openHelpTo("vip-bypass-case-study")}
              />
            </div>
            <CardDescription className="text-xs">
              Direct device whitelisting (VIP fast-track) and targeted emergency
              blacklisting
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Allow Devices (Gate 3) */}
            <FeatureDeviceTagInput
              id="allow-devices"
              label="VIP Allow List (Gate 3)"
              subtitle="Devices in this list immediately receive enabled: true, bypassing Channel, Platform, Build and 0% Rollout!"
              devices={allowDevices}
              onChange={(next) =>
                setValue("allowDevices", next, { shouldValidate: true })
              }
              conflictingDevices={denyDevices}
              variant="allow"
              maxDevices={50}
            />

            {/* Deny Devices (Gate 2) */}
            <FeatureDeviceTagInput
              id="deny-devices"
              label="Emergency Deny List (Gate 2)"
              subtitle="Faulty device blacklisting. Forces enabled: false, overruling 100% rollout and explicit Allow lists."
              devices={denyDevices}
              onChange={(next) =>
                setValue("denyDevices", next, { shouldValidate: true })
              }
              conflictingDevices={allowDevices}
              variant="deny"
              maxDevices={50}
            />
          </CardContent>
        </Card>

        {/* 6. Runtime Payload JSON */}
        <Card className="border border-border shadow-xs">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileCode2 className="size-4 text-primary" />
                <CardTitle className="text-sm font-semibold">
                  6. Dynamic Runtime Payload (JSON)
                </CardTitle>
              </div>
              <HelpTip
                content="Arbitrary JSON parameters delivered to the mobile app when the flag evaluates to enabled: true."
                onLearnMore={() => openHelpTo("feature-vs-remote-config")}
              />
            </div>
            <CardDescription className="text-xs">
              Dynamic configuration parameters delivered to mobile apps when
              this flag is enabled
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
              minHeight="180px"
            />
          </CardContent>
        </Card>

        {/* 7. Live In-Form Device Evaluator */}
        <FeatureSimulatorCard
          flagConfig={{
            key: currentKey || "test_key",
            enabled: currentEnabled,
            platforms: currentPlatforms,
            channels: currentChannels,
            rolloutPercentage: currentRollout,
            minBuildNumber: currentMinBuild,
            maxBuildNumber: currentMaxBuild,
            allowDevices: allowDevices,
            denyDevices: denyDevices,
            payload: currentPayload,
          }}
        />

        {/* Bottom Action Bar */}
        <div className="flex w-full flex-col gap-3 pt-2 sm:flex-row">
          <Button
            type="submit"
            className="w-full flex-1 cursor-pointer font-semibold sm:w-auto"
            disabled={isPending}
          >
            {isPending && <Loader />}
            {isEditing ? "Save Changes" : "Create Feature Flag"}
          </Button>

          <Button
            type="button"
            variant="outline"
            className="w-full flex-1 cursor-pointer sm:w-auto"
            onClick={onCancel}
          >
            Cancel
          </Button>
        </div>
      </form>

      {/* Slide-over Help & Operations Guide Drawer */}
      <FeatureHelpDrawer
        open={helpOpen}
        onOpenChange={setHelpOpen}
        initialTopicId={activeHelpTopicId}
        activeFlagConfig={{
          key: currentKey || "test_key",
          enabled: currentEnabled,
          platforms: currentPlatforms,
          channels: currentChannels,
          rolloutPercentage: currentRollout,
          minBuildNumber: currentMinBuild,
          maxBuildNumber: currentMaxBuild,
          allowDevices: allowDevices,
          denyDevices: denyDevices,
          payload: currentPayload,
        }}
      />
    </div>
  )
}

export default FeatureForm
