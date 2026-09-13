import { z } from "zod"
import type { AuthUser } from "../../shared/types/auth-user.js"

export const loginSchema = z.object({
  phone: z.string({ error: "Phone is required" }).min(1),
  password: z.string({ error: "Password is required" }).min(1),
})

export type LoginInput = z.infer<typeof loginSchema>

export interface LoginResponse {
  token: string
  user: AuthUser
}
