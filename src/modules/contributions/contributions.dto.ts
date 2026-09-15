import { z } from "zod"
import { moneySchema } from "../../shared/validation/money.js"

const contributionTypeSchema = z.enum(["TARGETED", "OPEN"])

export const createContributionSchema = z
  .object({
    title: z.string({ error: "Title is required" }).trim().min(1),
    description: z.string().trim().nullable().optional(),
    type: contributionTypeSchema,
    targetAmount: moneySchema.nullable().optional(),
    deadline: z.string().datetime().nullable().optional(),
  })
  .refine((data) => data.type !== "TARGETED" || data.targetAmount != null, {
    message: "A TARGETED contribution requires a target amount",
    path: ["targetAmount"],
  })
  .refine((data) => data.type !== "OPEN" || data.targetAmount == null, {
    message: "An OPEN contribution cannot have a target amount",
    path: ["targetAmount"],
  })

export const updateContributionSchema = z.object({
  title: z.string().trim().min(1).optional(),
  description: z.string().trim().nullable().optional(),
  targetAmount: moneySchema.nullable().optional(),
  deadline: z.string().datetime().nullable().optional(),
})

export const listContributionsQuerySchema = z.object({
  type: contributionTypeSchema.optional(),
  status: z.enum(["OPEN", "CLOSED"]).optional(),
  search: z.string().trim().optional(),
})

export type CreateContributionInput = z.infer<typeof createContributionSchema>
export type UpdateContributionInput = z.infer<typeof updateContributionSchema>
export type ListContributionsQuery = z.infer<typeof listContributionsQuerySchema>

export interface ContributionDto {
  id: string
  title: string
  description: string | null
  type: "TARGETED" | "OPEN"
  targetAmount: string | null
  deadline: string | null
  status: "OPEN" | "CLOSED"
  createdAt: string
  totalCollected: string
  totalRequired: string
  totalDisbursed: string
  net: string
}

export interface TargetedMemberReportItem {
  memberId: string
  name: string
  phone: string | null
  required: string
  paid: string
  balance: string
}

export interface OpenMemberReportItem {
  memberId: string
  name: string
  phone: string | null
  totalPaid: string
}

export interface ContributionReportResponse {
  contribution: ContributionDto
  members: TargetedMemberReportItem[] | OpenMemberReportItem[]
}

export interface GroupBalanceResponse {
  totalCollected: string
  totalDisbursed: string
  balance: string
}
