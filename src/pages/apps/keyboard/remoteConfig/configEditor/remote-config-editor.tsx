import React, { useState, useEffect } from "react"
import { useNavigate, useParams, useSearchParams } from "react-router-dom"
import { useForm, Controller, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import SelectComponent from "@/components/inputComponents/select-component"
import JsonEditorComponent from "@/components/inputComponents/json-editor-component"
import Loader from "@/components/loader"
import { toast } from "sonner"
import { getFirstFormErrorMessage } from "@/utils/formUtils"
import { HelpButton } from "@/components/helpTour"
import { RemoteConfigHelpDrawer } from "../components/remote-config-help-drawer"
import {
  useGetRemoteConfig,
  useCreateRemoteConfig,
  useUpdateRemoteConfig,
} from "@/query/keyboard/useRemoteConfig"
import {
  createRemoteConfigSchema,
  type CreateRemoteConfigInputs,
  type UpdateRemoteConfigInputs,
} from "@/utils/schemas/keyboard/remoteConfigSchema"
import { ArrowLeft, Sliders, FileText, FileCode2, Copy } from "lucide-react"

interface RemoteConfigEditorProps {
  isCreate?: boolean
}

export const RemoteConfigEditor: React.FC<RemoteConfigEditorProps> = ({
  isCreate = false,
}) => {
  const navigate = useNavigate()
  const { id, appName } = useParams<{ id: string; appName: string }>()
  const appSlug = appName?.toLowerCase() || "keyboard"
  const [searchParams] = useSearchParams()
  const cloneFromId = searchParams.get("cloneFrom")
  const [helpOpen, setHelpOpen] = useState(false)

  // API Queries
  const { data: existingDocResponse, isLoading: isLoadingExisting } =
    useGetRemoteConfig(id)
  const { data: cloneSourceResponse, isLoading: isLoadingClone } =
    useGetRemoteConfig(cloneFromId ?? undefined)

  const existingConfig = existingDocResponse?.data
  const cloneSourceConfig = cloneSourceResponse?.data

  const createMutation = useCreateRemoteConfig()
  const updateMutation = useUpdateRemoteConfig()

  // Form setup
  const {
    register,
    control,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<CreateRemoteConfigInputs>({
    resolver: zodResolver(createRemoteConfigSchema),
    defaultValues: {
      platform: "android",
      minBuildNumber: 1,
      note: "",
      values: {},
    },
  })

  const currentValues = useWatch({ control, name: "values" }) || {}

  // Hydrate on Edit or Duplicate
  useEffect(() => {
    if (!isCreate && existingConfig) {
      reset({
        platform: existingConfig.platform as "android" | "ios",
        minBuildNumber: existingConfig.minBuildNumber,
        note: existingConfig.note || "",
        values: existingConfig.values || {},
      })
    } else if (isCreate && cloneSourceConfig) {
      reset({
        platform: cloneSourceConfig.platform as "android" | "ios",
        minBuildNumber: cloneSourceConfig.minBuildNumber + 1,
        note: `Clone of Build #${cloneSourceConfig.minBuildNumber}`,
        values: cloneSourceConfig.values || {},
      })
    }
  }, [isCreate, existingConfig, cloneSourceConfig, reset])

  const onSubmit = (formData: CreateRemoteConfigInputs) => {
    if (isCreate) {
      createMutation.mutate(formData, {
        onSuccess: () => navigate(`/${appSlug}/remote-config/list`),
      })
    } else if (id) {
      const updatePayload: UpdateRemoteConfigInputs = {
        minBuildNumber: formData.minBuildNumber,
        note: formData.note,
        values: formData.values,
      }
      updateMutation.mutate(
        { id, body: updatePayload },
        {
          onSuccess: () => navigate(`/${appSlug}/remote-config/list`),
        }
      )
    }
  }

  const handleCancel = () => {
    navigate(`/${appSlug}/remote-config/list`)
  }

  const isPending = createMutation.isPending || updateMutation.isPending
  const isInitialLoading =
    (!isCreate && isLoadingExisting) || (Boolean(cloneFromId) && isLoadingClone)

  if (isInitialLoading) {
    return (
      <div className="flex min-h-[50vh] flex-1 items-center justify-center">
        <Loader size={32} />
      </div>
    )
  }

  return (
    <div className="flex w-full flex-1 flex-col gap-6">
      {/* Header with back navigation and help */}
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
              {isCreate
                ? cloneFromId
                  ? "Duplicate as New Version"
                  : "New Remote Configuration"
                : "Edit Remote Configuration"}
            </h1>
            {!isCreate && existingConfig && (
              <Badge variant="outline" className="font-mono text-xs capitalize">
                {existingConfig.platform} • Build #
                {existingConfig.minBuildNumber}
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            {isCreate
              ? "Configure runtime parameters delivered to mobile devices by platform and minimum build number."
              : `Updating configuration tier for ${existingConfig?.platform} (Build #${existingConfig?.minBuildNumber})`}
          </p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <HelpButton
            onClick={() => setHelpOpen(true)}
            label="Configuration Guide"
          />
        </div>
      </div>

      {/* Clone Banner (if duplicating) */}
      {isCreate && cloneFromId && cloneSourceConfig && (
        <div className="flex items-center gap-3 rounded-lg border border-primary/20 bg-primary/5 p-4 text-xs text-primary">
          <Copy className="h-4 w-4 shrink-0" />
          <div className="flex-1">
            <strong>
              Duplicating from Build #{cloneSourceConfig.minBuildNumber} (
              {cloneSourceConfig.platform}).
            </strong>{" "}
            All configuration parameters have been pre-filled. Enter the new
            target build number and adjust values as needed.
          </div>
        </div>
      )}

      <form
        id="remote-config-form"
        onSubmit={handleSubmit(onSubmit, (formErrors) => {
          const errorMsg = getFirstFormErrorMessage(formErrors)
          if (errorMsg) {
            toast.error(errorMsg)
          }
        })}
        className="flex flex-col gap-6"
      >
        {/* 1. Target Scope & Build Threshold */}
        <Card className="border border-border shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Sliders className="h-4 w-4 text-primary" />
              <CardTitle className="text-base font-semibold">
                1. Target Platform & Minimum Build
              </CardTitle>
            </div>
            <CardDescription className="text-xs">
              Platform identity and minimum required app build number threshold
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* Platform */}
              <div className="space-y-2">
                <Label htmlFor="platform">Platform *</Label>
                {isCreate ? (
                  <Controller
                    name="platform"
                    control={control}
                    render={({ field }) => (
                      <SelectComponent
                        id="platform"
                        value={field.value}
                        onValueChange={field.onChange}
                        placeholder="Select platform"
                        disabled={isPending}
                        data={[
                          { name: "Android", value: "android" },
                          { name: "iOS", value: "ios" },
                        ]}
                      />
                    )}
                  />
                ) : (
                  <div className="flex h-9 items-center rounded-md border border-input bg-muted px-3 text-xs text-muted-foreground capitalize">
                    {existingConfig?.platform} (Platform scope is immutable for
                    existing records)
                  </div>
                )}
                {errors.platform && (
                  <p className="text-xs text-destructive">
                    {errors.platform.message}
                  </p>
                )}
              </div>

              {/* Minimum Build Number */}
              <div className="space-y-2">
                <Label htmlFor="minBuildNumber">Minimum Build Number *</Label>
                <Input
                  id="minBuildNumber"
                  type="number"
                  min={1}
                  placeholder="e.g. 1, 10, 25"
                  disabled={isPending}
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
                  Whole integer build number (e.g. 10). Devices running this
                  build or higher will receive this payload.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 2. Release Note / Label */}
        <Card className="border border-border shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              <CardTitle className="text-base font-semibold">
                2. Release Note / Label
              </CardTitle>
            </div>
            <CardDescription className="text-xs">
              Human-readable descriptor to identify this version tier in the
              admin list
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Input
              id="note"
              placeholder="e.g. v1.2 Release with AI Toolbar, Keyboard v2.0 baseline"
              disabled={isPending}
              {...register("note")}
            />
            {errors.note && (
              <p className="mt-1 text-xs text-destructive">
                {errors.note.message}
              </p>
            )}
          </CardContent>
        </Card>

        {/* 3. Configuration Parameters (JSON) */}
        <Card className="border border-border shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <FileCode2 className="h-4 w-4 text-primary" />
              <CardTitle className="text-base font-semibold">
                3. Configuration Parameters (JSON)
              </CardTitle>
            </div>
            <CardDescription className="text-xs">
              Key-value configuration dictionary served to devices. Keys cannot
              start with "$" or contain ".".
            </CardDescription>
          </CardHeader>
          <CardContent>
            <JsonEditorComponent
              id="values-editor"
              label="JSON Values Object"
              value={currentValues}
              onChange={(parsedVal: Record<string, unknown>) => {
                setValue("values", parsedVal, { shouldValidate: true })
              }}
              disabled={isPending}
              error={
                errors.values && typeof errors.values.message === "string"
                  ? errors.values.message
                  : undefined
              }
              minHeight="320px"
            />
          </CardContent>
        </Card>

        {/* Bottom Action Bar */}
        <div className="flex w-full flex-col gap-3 pt-2 sm:flex-row">
          <Button
            type="submit"
            className="w-full flex-1 cursor-pointer sm:w-auto"
            disabled={isPending}
          >
            {isPending && <Loader />}
            {isCreate ? "Create Configuration" : "Save Changes"}
          </Button>

          <Button
            type="button"
            variant="outline"
            className="w-full flex-1 cursor-pointer sm:w-auto"
            onClick={handleCancel}
            disabled={isPending}
          >
            Cancel
          </Button>
        </div>
      </form>

      {/* Operations Guide Bottom Drawer */}
      <RemoteConfigHelpDrawer open={helpOpen} onOpenChange={setHelpOpen} />
    </div>
  )
}

export default RemoteConfigEditor
