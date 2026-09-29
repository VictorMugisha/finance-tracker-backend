import { z } from "zod"
import { moneySchema } from "../../shared/validation/money.js"

export const createAssignmentSchema = z.object({
  memberId: z.string({ error: "Member is required" }).min(1),
  requiredAmount: moneySchema,
})

export const updateAssignmentSchema = z.object({
  requiredAmount: moneySchema,
})

export const assignBulkSchema = z.object({
  memberIds: z
    .array(z.string({ error: "Member is required" }).min(1), {
      error: "At least one member is required",
    })
    .min(1),
  amount: moneySchema,
})

export type CreateAssignmentInput = z.infer<typeof createAssignmentSchema>
export type UpdateAssignmentInput = z.infer<typeof updateAssignmentSchema>
export type AssignBulkInput = z.infer<typeof assignBulkSchema>

export interface AssignmentDto {
  id: string
  contributionId: string
  memberId: string
  memberName: string
  requiredAmount: string
}

export interface AssignBulkResult {
  assigned: number
}
