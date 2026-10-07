import { useNavigate, useParams } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  updateCampaignSchema,
  type UpdateCampaignInputs,
} from "@/utils/schemas/keyboard/campaignSchema"
import type { MediaResponse } from "@/configurations/types"
import {
  useGetCampaignById,
  useUpdateCampaign,
} from "@/query/keyboard/useCampaign"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useEffect, useState } from "react"
import SingleDropBox from "@/components/mediaComponents/single-drop-box"
import Loader from "@/components/loader"
import { toast } from "sonner"
import { useDeleteMediaById } from "@/query/useMedia"
import { ArrowLeft } from "lucide-react"

export default function UpdateCampaign() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [mediaResp, setMediaResp] = useState<MediaResponse | null>(null)

  const { data: campaign, isLoading } = useGetCampaignById(id || "")
  const { mutate, isPending } = useUpdateCampaign()
  const { mutate: deleteMediaMutate } = useDeleteMediaById()

  const {
    register,
    setValue,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UpdateCampaignInputs>({
    resolver: zodResolver(updateCampaignSchema),
    defaultValues: { name: "", iconLink: "", link: "" },
  })

  useEffect(() => {
    if (campaign) {
      reset({
        name: campaign.name || "",
        iconLink: campaign.iconLink || "",
        link: campaign.link || "",
      })
    }
  }, [campaign, reset])

  useEffect(() => {
    if (mediaResp?.data?.link1) {
      setValue("iconLink", mediaResp.data.link1, { shouldValidate: true })
    }
  }, [mediaResp, setValue])

  const onSubmit = (data: UpdateCampaignInputs) => {
    if (!id) return
    mutate(
      { id, body: data },
      {
        onSuccess: () => {
          navigate("/keyboard/campaign/list")
        },
      }
    )
  }

  const deleteMediaById = () => {
    if (mediaResp?.data?._id) {
      deleteMediaMutate({ id: mediaResp.data._id }, {})
    }
  }

  if (isLoading) {
    return (
      <div className="p-8 text-center">
        <Loader />
      </div>
    )
  }

  return (
    <form className="flex flex-1 flex-col gap-6">
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex cursor-default flex-col gap-1 text-left">
            <h1 className="text-2xl font-bold tracking-tight">
              Update Campaign
            </h1>
            <p className="text-sm text-balance text-muted-foreground">
              Edit details for {campaign?.name}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="grid gap-3">
            <Label htmlFor="name">Campaign Name</Label>
            <Input
              id="name"
              type="text"
              placeholder="e.g. Swiggy Promo"
              aria-invalid={errors.name ? "true" : "false"}
              {...register("name")}
              errorTooltip={errors?.name?.message}
            />
          </div>

          <div className="grid gap-3">
            <Label htmlFor="link">Destination Link</Label>
            <Input
              id="link"
              type="text"
              placeholder="https://..."
              aria-invalid={errors.link ? "true" : "false"}
              {...register("link")}
              errorTooltip={errors?.link?.message}
            />
          </div>

          <div className="grid gap-3 md:col-span-2">
            <Label htmlFor="icon-upload">Change Icon</Label>
            <SingleDropBox
              id="icon-upload"
              setMediaResp={setMediaResp}
              type="campaign"
              errorTooltip={errors?.iconLink?.message}
              className="h-28"
              aspectRatioText="1:1"
            />
            {/* Show existing icon URL for context */}
            {campaign?.iconLink && !mediaResp && (
              <p className="mt-2 text-sm text-muted-foreground">
                Current Icon:{" "}
                <a
                  href={campaign.iconLink}
                  target="_blank"
                  rel="noreferrer"
                  className="break-all text-primary transition-all hover:underline"
                >
                  {campaign.iconLink}
                </a>
              </p>
            )}
          </div>
        </div>

        <div className="flex w-full flex-col gap-3 pt-4 lg:flex-row">
          <Button
            type="button"
            className="w-full flex-1 cursor-pointer lg:w-auto"
            disabled={isPending}
            onClick={handleSubmit(onSubmit, (formErrors) => {
              const firstError = Object.values(formErrors)[0]
              if (firstError?.message) {
                toast.error(
                  (firstError.message as string) || "Validation error"
                )
              }
            })}
          >
            {isPending && <Loader />}
            Update Campaign
          </Button>

          <Button
            type="button"
            variant="outline"
            className="w-full flex-1 cursor-pointer lg:w-auto"
            onClick={() => {
              deleteMediaById()
              navigate(-1)
            }}
          >
            Cancel
          </Button>
        </div>
      </div>
    </form>
  )
}
