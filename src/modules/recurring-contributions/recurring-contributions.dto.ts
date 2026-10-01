import { z } from "zod"
import { moneySchema } from "../../shared/validation/money.js"
import type { ContributionDto } from "../contributions/contributions.dto.js"

export const recurringPeriodSchema = z.enum(["WEEKLY", "MONTHLY", "QUARTERLY"])

export const createRecurringSchema = z.object({
  title: z.string({ error: "Title is required" }).trim().min(1),
  description: z.string().trim().nullable().optional(),
  period: recurringPeriodSchema,
  targetAmount: moneySchema,
})

export const updateRecurringSchema = z.object({
  title: z.string().trim().min(1).optional(),
  description: z.string().trim().nullable().optional(),
  period: recurringPeriodSchema.optional(),
  targetAmount: moneySchema.optional(),
})

export const rolloverSchema = z.object({
  title: z.string({ error: "Title is required" }).trim().min(1),
})

export type CreateRecurringInput = z.infer<typeof createRecurringSchema>
export type UpdateRecurringInput = z.infer<typeof updateRecurringSchema>
export type RolloverInput = z.infer<typeof rolloverSchema>
export type RecurringPeriodValue = z.infer<typeof recurringPeriodSchema>

export interface RecurringContributionDto {
  id: string
  title: string
  description: string | null
  period: RecurringPeriodValue
  targetAmount: string | null
  isClosed: boolean
  createdAt: string
  periodCount: number
}

export interface RolloverResult {
  id: string
  period: number
  assigned: number
}

export interface RecurringContributionDetailResponse {
  recurring: RecurringContributionDto
  periods: ContributionDto[]
}

export interface RecurringPeriodSummary {
  id: string
  period: number
  status: "OPEN" | "CLOSED"
  createdAt: string
  totalRequired: string
  totalCollected: string
  totalDisbursed: string
  net: string
}

export interface RecurringMemberReportItem {
  memberId: string
  name: string
  phone: string | null
  isActive: boolean
  totalRequired: string
  totalPaid: string
  balance: string
}

export interface RecurringReportResponse {
  recurring: RecurringContributionDto
  periods: RecurringPeriodSummary[]
  members: RecurringMemberReportItem[]
}
