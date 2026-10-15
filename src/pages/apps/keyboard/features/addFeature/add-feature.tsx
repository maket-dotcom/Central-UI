import React from "react"
import { useNavigate, useParams } from "react-router-dom"
import { useCreateFeature } from "@/query/keyboard/useFeature"
import { FeatureForm } from "../components/feature-form"
import type { CreateFeatureInputs } from "@/utils/schemas/keyboard/featureSchema"

export const AddFeature: React.FC = () => {
  const navigate = useNavigate()
  const { appName } = useParams<{ appName: string }>()
  const appSlug = appName?.toLowerCase() || "keyboard"
  const createMutation = useCreateFeature()

  const handleSubmit = (formData: CreateFeatureInputs) => {
    createMutation.mutate(
      { body: formData },
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

  return (
    <FeatureForm
      isEditing={false}
      onSubmit={handleSubmit}
      isPending={createMutation.isPending}
      onCancel={handleCancel}
    />
  )
}

export default AddFeature
