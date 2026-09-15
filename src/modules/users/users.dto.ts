import { z } from "zod"

const phoneSchema = z
  .string({ error: "Phone is required" })
  .trim()
  .regex(/^07\d{8}$/, "Phone must be 10 digits starting with 07")

export const createUserSchema = z.object({
  memberId: z.string().trim().nullable().optional(),
  name: z.string({ error: "Name is required" }).trim().min(1),
  phone: phoneSchema,
  password: z
    .string({ error: "Password is required" })
    .min(6, "Password must be at least 6 characters"),
  permissions: z.array(z.string().trim()).optional(),
})

export const updateUserSchema = z.object({
  memberId: z.string().trim().nullable().optional(),
  name: z.string().trim().min(1).optional(),
  phone: phoneSchema.optional(),
  password: z.string().min(6, "Password must be at least 6 characters").optional(),
  isActive: z.boolean().optional(),
})

export const setPermissionsSchema = z.object({
  permissions: z.array(z.string().trim()),
})

export type CreateUserInput = z.infer<typeof createUserSchema>
export type UpdateUserInput = z.infer<typeof updateUserSchema>
export type SetPermissionsInput = z.infer<typeof setPermissionsSchema>

export interface UserDto {
  id: string
  name: string
  phone: string
  isAdmin: boolean
  isActive: boolean
  memberId: string | null
  memberName: string | null
  role: string | null
  permissions: string[]
  createdAt: string
}
