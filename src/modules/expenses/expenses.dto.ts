import { z } from "zod"
import { moneySchema } from "../../shared/validation/money.js"

export const expenseTypeSchema = z.enum(["HANDOVER", "MEMBER_SUPPORT", "LEISURE", "OTHER"])

export const createExpenseSchema = z.object({
  contributionId: z.string().trim().nullable().optional(),
  type: expenseTypeSchema,
  amount: moneySchema,
  recipientMemberId: z.string().trim().nullable().optional(),
  description: z.string().trim().nullable().optional(),
  spentAt: z.string().datetime().nullable().optional(),
})

export const updateExpenseSchema = z.object({
  contributionId: z.string().trim().nullable().optional(),
  type: expenseTypeSchema.optional(),
  amount: moneySchema.optional(),
  recipientMemberId: z.string().trim().nullable().optional(),
  description: z.string().trim().nullable().optional(),
  spentAt: z.string().datetime().optional(),
})

export const listExpensesQuerySchema = z.object({
  contributionId: z.string().trim().optional(),
  type: expenseTypeSchema.optional(),
  recipientMemberId: z.string().trim().optional(),
})

export type ExpenseTypeValue = z.infer<typeof expenseTypeSchema>
export type CreateExpenseInput = z.infer<typeof createExpenseSchema>
export type UpdateExpenseInput = z.infer<typeof updateExpenseSchema>
export type ListExpensesQuery = z.infer<typeof listExpensesQuerySchema>

export interface ExpenseDto {
  id: string
  contributionId: string | null
  contributionTitle: string | null
  type: ExpenseTypeValue
  amount: string
  recipientMemberId: string | null
  recipientMemberName: string | null
  description: string | null
  spentAt: string
  createdAt: string
  updatedAt: string
}
