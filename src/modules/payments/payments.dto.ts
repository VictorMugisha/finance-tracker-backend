import { z } from "zod"
import { moneySchema } from "../../shared/validation/money.js"

export const createPaymentSchema = z.object({
  contributionId: z.string({ error: "Contribution is required" }).min(1),
  memberId: z.string({ error: "Member is required" }).min(1),
  amount: moneySchema,
  note: z.string().trim().nullable().optional(),
  paidAt: z.string().datetime().nullable().optional(),
})

export const updatePaymentSchema = z.object({
  amount: moneySchema.optional(),
  note: z.string().trim().nullable().optional(),
  paidAt: z.string().datetime().optional(),
})

export const listPaymentsQuerySchema = z.object({
  contributionId: z.string().optional(),
  memberId: z.string().optional(),
})

export type CreatePaymentInput = z.infer<typeof createPaymentSchema>
export type UpdatePaymentInput = z.infer<typeof updatePaymentSchema>
export type ListPaymentsQuery = z.infer<typeof listPaymentsQuerySchema>

export interface PaymentDto {
  id: string
  contributionId: string
  contributionTitle: string
  memberId: string
  memberName: string
  amount: string
  paidAt: string
  note: string | null
  createdAt: string
  updatedAt: string
}
