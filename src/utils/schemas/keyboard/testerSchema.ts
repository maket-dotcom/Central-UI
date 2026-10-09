import { z } from "zod"

export const testerChannelEnum = z.enum(["internal", "beta"])
export type TesterChannel = z.infer<typeof testerChannelEnum>

export interface Tester {
  _id: string
  deviceId: string
  channel: TesterChannel
  name?: string
  createdAt: string
  updatedAt: string
}

export const upsertTesterSchema = z.object({
  deviceId: z
    .string()
    .trim()
    .min(1, "Device ID is required")
    .max(100, "Device ID must be under 100 characters"),
  channel: testerChannelEnum,
  name: z
    .string()
    .trim()
    .max(100, "Name must be under 100 characters")
    .optional(),
})

export type UpsertTesterInputs = z.infer<typeof upsertTesterSchema>
