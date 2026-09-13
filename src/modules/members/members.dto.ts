import { z } from "zod"

export const groupRoleSchema = z.enum(["LEADER", "ASSISTANT", "ACCOUNTANT", "MEMBER"])

export const createMemberSchema = z.object({
  name: z.string({ error: "Name is required" }).trim().min(1),
  phone: z.string().trim().nullable().optional(),
  role: groupRoleSchema.nullable().optional(),
})

export const updateMemberSchema = createMemberSchema.partial().extend({
  isActive: z.boolean().optional(),
})

export const listMembersQuerySchema = z.object({
  search: z.string().trim().optional(),
})

export type GroupRoleValue = z.infer<typeof groupRoleSchema>
export type CreateMemberInput = z.infer<typeof createMemberSchema>
export type UpdateMemberInput = z.infer<typeof updateMemberSchema>
export type ListMembersQuery = z.infer<typeof listMembersQuerySchema>

export interface LinkedUserDto {
  id: string
  name: string
  phone: string
  isAdmin: boolean
  isActive: boolean
  memberId: string | null
  createdAt: string
}

export interface MemberDto {
  id: string
  name: string
  phone: string | null
  role: GroupRoleValue | null
  isActive: boolean
  createdAt: string
  user: LinkedUserDto | null
}
