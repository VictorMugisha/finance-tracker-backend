import { z } from "zod"
import { moneySchema } from "../../shared/validation/money.js"

export const createAssignmentSchema = z.object({
  memberId: z.string({ error: "Member is required" }).min(1),
  requiredAmount: moneySchema,
})

export const updateAssignmentSchema = z.object({
  requiredAmount: moneySchema,
})

export type CreateAssignmentInput = z.infer<typeof createAssignmentSchema>
export type UpdateAssignmentInput = z.infer<typeof updateAssignmentSchema>

export interface AssignmentDto {
  id: string
  contributionId: string
  memberId: string
  memberName: string
  requiredAmount: string
}
