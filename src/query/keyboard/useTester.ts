import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { getErrorMessage } from "@/utils/getErrorMessage"
import {
  getTesters,
  upsertTester,
  deleteTester,
} from "@/services/keyboard/tester"
import type { UpsertTesterInputs } from "@/utils/schemas/keyboard/testerSchema"

export const useGetTesters = ({
  initialized = true,
}: { initialized?: boolean } = {}) => {
  return useQuery({
    queryKey: ["testers"],
    queryFn: () => getTesters(),
    enabled: initialized,
  })
}

export const useUpsertTester = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: {
      deviceId: string
      body: Omit<UpsertTesterInputs, "deviceId">
    }) => upsertTester(payload),
    onSuccess: () => {
      toast.success("Tester device saved successfully")
      queryClient.invalidateQueries({ queryKey: ["testers"] })
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error))
    },
  })
}

export const useDeleteTester = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: { deviceId: string }) => deleteTester(payload),
    onSuccess: () => {
      toast.success("Tester device removed successfully")
      queryClient.invalidateQueries({ queryKey: ["testers"] })
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error))
    },
  })
}
