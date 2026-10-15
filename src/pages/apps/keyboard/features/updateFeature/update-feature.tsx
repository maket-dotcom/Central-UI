import React from "react"
import { useNavigate, useParams } from "react-router-dom"
import {
  useGetFeatureByKey,
  useUpdateFeature,
} from "@/query/keyboard/useFeature"
import { FeatureForm } from "../components/feature-form"
import Loader from "@/components/loader"
import type { CreateFeatureInputs } from "@/utils/schemas/keyboard/featureSchema"

export const UpdateFeature: React.FC = () => {
  const navigate = useNavigate()
  const { key, appName } = useParams<{ key: string; appName: string }>()
  const appSlug = appName?.toLowerCase() || "keyboard"

  const {
    data: featureResp,
    isLoading,
    isError,
  } = useGetFeatureByKey(key || "")
  const updateMutation = useUpdateFeature()

  const feature = featureResp?.data

  const handleSubmit = (formData: CreateFeatureInputs) => {
    if (!key) return

    // Omit key from update body as key is immutable
    const bodyWithoutKey = { ...formData }
    delete (bodyWithoutKey as { key?: string }).key

    updateMutation.mutate(
      { key, body: bodyWithoutKey },
      {
        onSuccess: () => {
          navigate(`/${appSlug}/features/list`)
        },
      }
    )
  }

  const handleCancel = () => {
    navigate(`/${appSlug}/features/list`)
  }

  if (isLoading) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-2">
        <Loader size={28} />
        <p className="text-xs text-muted-foreground">
          Loading feature flag configuration...
        </p>
      </div>
    )
  }

  if (isError || !feature) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-3 text-center">
        <p className="text-sm font-semibold text-destructive">
          Failed to load feature flag "{key}".
        </p>
        <button
          type="button"
          onClick={handleCancel}
          className="cursor-pointer text-xs text-primary hover:underline"
        >
          &larr; Return to Feature Flags
        </button>
      </div>
    )
  }

  return (
    <FeatureForm
      isEditing={true}
      featureKey={key}
      initialValues={feature}
      onSubmit={handleSubmit}
      isPending={updateMutation.isPending}
      onCancel={handleCancel}
    />
  )
}

export default UpdateFeature
