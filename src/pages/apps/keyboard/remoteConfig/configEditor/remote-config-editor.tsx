import { useEffect } from "react"
import { useNavigate, useParams, useSearchParams } from "react-router-dom"
import { useForm, Controller, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { ArrowLeft, Sliders, Layers, FileCode2 } from "lucide-react"
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
import SelectComponent from "@/components/inputComponents/select-component"
import Loader from "@/components/loader"
import { JsonEditorComponent } from "@/components/inputComponents/json-editor-component"
import { toast } from "sonner"
import { getFirstFormErrorMessage } from "@/utils/formUtils"
import {
  useGetConfig,
  usePutConfig,
} from "@/query/keyboard/useRemoteConfig"
import {
  putConfigSchema,
  type PutConfigInputs,
  type ConfigPlatform,
} from "@/utils/schemas/keyboard/remoteConfigSchema"

interface RemoteConfigEditorProps {
  isCreate?: boolean
}

export default function RemoteConfigEditor({
  isCreate: isCreateProp,
}: RemoteConfigEditorProps = {}) {
  const navigate = useNavigate()
  const { namespace: routeNamespace, platform: routePlatform } = useParams<{
    namespace?: string
    platform?: ConfigPlatform
  }>()
  const [searchParams] = useSearchParams()

  const isEditing = !isCreateProp && !!(routeNamespace && routePlatform)
  const isCreate = !isEditing

  const defaultNamespace = searchParams.get("namespace") || ""
  const defaultPlatform = (searchParams.get("platform") as ConfigPlatform) || "all"

  const { data: configResp, isLoading: isConfigLoading, isError } = useGetConfig({
    namespace: routeNamespace || "",
    platform: routePlatform || "all",
  })
  const putConfigMutation = usePutConfig()

  const currentConfig = configResp?.data

  const {
    register,
    handleSubmit,
    control,
    setValue,
    reset,
    formState: { errors },
  } = useForm<PutConfigInputs>({
    resolver: zodResolver(putConfigSchema),
    defaultValues: {
      namespace: defaultNamespace,
      platform: defaultPlatform,
      values: {},
      expectedVersion: undefined,
    },
  })

  // Hydrate form values
  useEffect(() => {
    if (isEditing && currentConfig) {
      reset({
        namespace: currentConfig.namespace,
        platform: currentConfig.platform,
        values: currentConfig.values || {},
        minBuildNumber: currentConfig.minBuildNumber,
        maxBuildNumber: currentConfig.maxBuildNumber,
      })
    } else if (isCreate) {
      setValue("namespace", defaultNamespace)
      setValue("platform", defaultPlatform)
    }
  }, [
    isEditing,
    currentConfig,
    isCreate,
    defaultNamespace,
    defaultPlatform,
    reset,
    setValue,
  ])

  const onSubmit = (formData: PutConfigInputs) => {
    const expectedVersion = isEditing ? currentConfig?.version : 0

    putConfigMutation.mutate(
      {
        namespace: formData.namespace,
        platform: formData.platform,
        body: {
          values: formData.values,
          minBuildNumber: formData.minBuildNumber,
          maxBuildNumber: formData.maxBuildNumber,
          expectedVersion,
        },
      },
      {
        onSuccess: () => {
          navigate("/keyboard/remote-config/list")
        },
      }
    )
  }

  const handleCancel = () => {
    navigate("/keyboard/remote-config/list")
  }

  const valuesData = useWatch({ control, name: "values" }) || {}

  if (isEditing && isConfigLoading) {
    return (
      <div className="flex min-h-100 flex-col items-center justify-center gap-3 p-8 text-center">
        <Loader size={32} />
        <p className="text-sm text-muted-foreground">
          Loading configuration document...
        </p>
      </div>
    )
  }

  if (isEditing && (isError || !currentConfig)) {
    return (
      <div className="flex flex-1 flex-col gap-6 w-full">
        <div className="overflow-hidden rounded-xl border border-destructive/30 bg-destructive/10 p-8 text-center">
          <h2 className="text-base font-semibold text-destructive">
            Configuration Document Not Found
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            The configuration for namespace &ldquo;{routeNamespace}&rdquo; on platform &ldquo;{routePlatform}&rdquo; does not exist or has been removed.
          </p>
          <Button
            onClick={handleCancel}
            variant="outline"
            size="sm"
            className="mt-4 cursor-pointer"
          >
            Back to Remote Configurations
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
          aria-label="Back to remote configurations"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex cursor-default flex-col gap-1 text-left">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight">
              {isEditing
                ? "Edit Configuration"
                : "New Configuration Document"}
            </h1>
            {isEditing && currentConfig && (
              <Badge variant="secondary" className="font-mono text-xs">
                v{currentConfig.version}
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            {isEditing
              ? `Publish changes for namespace "${routeNamespace}" on platform "${routePlatform}"`
              : "Create a new baseline configuration or platform-specific override"}
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
        {/* 1. Configuration Scope */}
        <Card className="border border-border shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Sliders className="h-4 w-4 text-primary" />
              <CardTitle className="text-base font-semibold">
                1. Configuration Scope
              </CardTitle>
            </div>
            <CardDescription className="text-xs">
              Namespace identifier and targeted device operating system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {/* Namespace */}
              <div className="space-y-2">
                <Label htmlFor="namespace">Namespace *</Label>
                <Input
                  id="namespace"
                  placeholder="e.g. keyboard, theme, ai_model"
                  disabled={isEditing || putConfigMutation.isPending}
                  {...register("namespace")}
                />
                {errors.namespace && (
                  <p className="text-xs text-destructive">
                    {errors.namespace.message}
                  </p>
                )}
                {isEditing && (
                  <p className="text-xs text-muted-foreground">
                    Namespace cannot be changed once created.
                  </p>
                )}
              </div>

              {/* Platform */}
              <div className="space-y-2">
                <Label htmlFor="platform">Target Platform *</Label>
                <Controller
                  name="platform"
                  control={control}
                  render={({ field }) => (
                    <SelectComponent
                      id="platform"
                      value={field.value}
                      onValueChange={field.onChange}
                      placeholder="Select platform"
                      disabled={isEditing || putConfigMutation.isPending}
                      data={[
                        { name: "All (Baseline Document)", value: "all" },
                        { name: "Android (Platform Override)", value: "android" },
                        { name: "iOS (Platform Override)", value: "ios" },
                      ]}
                      className="w-full"
                    />
                  )}
                />
                {errors.platform && (
                  <p className="text-xs text-destructive">
                    {errors.platform.message}
                  </p>
                )}
                {isEditing && (
                  <p className="text-xs text-muted-foreground">
                    Platform scope is immutable for existing records.
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 2. Build Version Constraints */}
        <Card className="border border-border shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-primary" />
              <CardTitle className="text-base font-semibold">
                2. Build Version Constraints (Optional)
              </CardTitle>
            </div>
            <CardDescription className="text-xs">
              Limit this configuration document to specific client build number ranges
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="minBuildNumber">Minimum Build Number</Label>
                <Input
                  id="minBuildNumber"
                  type="number"
                  min={1}
                  placeholder="e.g. 1"
                  disabled={putConfigMutation.isPending}
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
                <p className="text-xs text-muted-foreground">
                  Builds below this number will not receive this configuration document.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxBuildNumber">Maximum Build Number</Label>
                <Input
                  id="maxBuildNumber"
                  type="number"
                  min={1}
                  placeholder="e.g. 50"
                  disabled={putConfigMutation.isPending}
                  {...register("maxBuildNumber", {
                    setValueAs: (v) =>
                      v === "" || isNaN(v) ? undefined : Number(v),
                  })}
                />
                {errors.maxBuildNumber && (
                  <p className="text-xs text-destructive">
                    {errors.maxBuildNumber.message}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  Builds above this number will not receive this configuration document.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 3. Configuration Values (JSON) */}
        <Card className="border border-border shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <FileCode2 className="h-4 w-4 text-primary" />
              <CardTitle className="text-base font-semibold">
                3. Configuration Values (JSON)
              </CardTitle>
            </div>
            <CardDescription className="text-xs">
              Key-value configuration dictionary served to devices. Keys cannot start with "$" or contain ".".
            </CardDescription>
          </CardHeader>
          <CardContent>
            <JsonEditorComponent
              id="values-editor"
              label="JSON Values Object"
              value={valuesData}
              onChange={(parsedVal: Record<string, unknown>) => {
                setValue("values", parsedVal, { shouldValidate: true })
              }}
              disabled={putConfigMutation.isPending}
              error={
                errors.values?.message ? String(errors.values.message) : undefined
              }
              minHeight="280px"
            />
          </CardContent>
        </Card>

        {/* Optimistic Locking Info */}
        {isEditing && currentConfig && (
          <div className="flex items-center justify-between rounded-md border bg-muted/30 p-3 text-xs text-muted-foreground">
            <span>
              Optimistic concurrency lock active: Save will verify current
              version is <strong>v{currentConfig.version}</strong>.
            </span>
            <span className="font-mono text-xs">
              Last updated: {new Date(currentConfig.updatedAt).toLocaleString()}
            </span>
          </div>
        )}

        {/* Bottom Action Bar */}
        <div className="flex w-full flex-col gap-3 pt-2 sm:flex-row">
          <Button
            type="submit"
            className="w-full flex-1 cursor-pointer sm:w-auto"
            disabled={putConfigMutation.isPending}
          >
            {putConfigMutation.isPending && <Loader />}
            {isEditing ? "Publish Changes" : "Publish Config"}
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
