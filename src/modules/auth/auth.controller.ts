import type { Request, Response } from "express"
import { sendSuccess } from "../../shared/http/response.js"
import { checkPhoneSchema, loginSchema } from "./auth.dto.js"
import * as authService from "./auth.service.js"

export async function login(req: Request, res: Response): Promise<void> {
  const input = loginSchema.parse(req.body)
  const result = await authService.login(input)
  sendSuccess(res, 200, "Login successful", result)
}

export async function checkPhone(req: Request, res: Response): Promise<void> {
  const input = checkPhoneSchema.parse(req.body)
  const result = await authService.checkPhone(input)
  sendSuccess(res, 200, "Phone checked successfully", result)
}

export async function me(req: Request, res: Response): Promise<void> {
  const user = await authService.getCurrentUser(req.user!.id)
  sendSuccess(res, 200, "User fetched successfully", { user })
}
