import type { Request, Response } from "express"
import { sendSuccess } from "../../shared/http/response.js"
import { loginSchema } from "./auth.dto.js"
import * as authService from "./auth.service.js"

export async function login(req: Request, res: Response): Promise<void> {
  const input = loginSchema.parse(req.body)
  const result = await authService.login(input)
  sendSuccess(res, 200, "Login successful", result)
}

export async function me(req: Request, res: Response): Promise<void> {
  const user = await authService.getCurrentUser(req.user!.id)
  sendSuccess(res, 200, "User fetched successfully", { user })
}
