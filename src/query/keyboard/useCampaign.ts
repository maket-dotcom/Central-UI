import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { getErrorMessage } from "@/utils/getErrorMessage"
import {
  createCampaign,
  getCampaigns,
  getCampaignById,
  updateCampaignById,
  deleteCampaignById,
} from "@/services/keyboard/campaign"
import type { AddCampaignInputs } from "@/utils/schemas/keyboard/campaignSchema"

export const useCreateCampaign = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: { body: AddCampaignInputs }) =>
      createCampaign(payload),
    onSuccess: () => {
      toast.success("Campaign created successfully")
      queryClient.invalidateQueries({ queryKey: ["campaigns"] })
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error))
    },
  })
}

export const useGetCampaigns = ({
  params,
  initialized = true,
}: {
  params?: Record<string, unknown>
  initialized?: boolean
} = {}) => {
  return useQuery({
    queryKey: ["campaigns", params],
    queryFn: () => getCampaigns({ params }),
    enabled: initialized,
  })
}

export const useGetCampaignById = (id: string) => {
  return useQuery({
    queryKey: ["campaignById", id],
    queryFn: () => getCampaignById({ id }),
    enabled: !!id,
  })
}

export const useUpdateCampaign = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: { id: string; body: Record<string, unknown> }) =>
      updateCampaignById(payload),
    onSuccess: (_data, payload) => {
      toast.success("Campaign updated successfully")
      queryClient.invalidateQueries({ queryKey: ["campaigns"] })
      queryClient.invalidateQueries({
        queryKey: ["campaignById", payload.id],
      })
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error))
    },
  })
}

export const useDeleteCampaign = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: { id: string }) => deleteCampaignById(payload),
    onSuccess: () => {
      toast.success("Campaign deleted successfully")
      queryClient.invalidateQueries({ queryKey: ["campaigns"] })
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error))
    },
  })
}
