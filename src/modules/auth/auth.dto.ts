import { z } from "zod"
import type { AuthUser } from "../../shared/types/auth-user.js"

export const loginSchema = z.object({
  phone: z.string().min(1, "Phone is required"),
  password: z.string().min(1, "Password is required"),
})

export type LoginInput = z.infer<typeof loginSchema>

export interface LoginResponse {
  token: string
  user: AuthUser
}
