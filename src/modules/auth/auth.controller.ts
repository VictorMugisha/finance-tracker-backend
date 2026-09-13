import type { Request, Response } from "express"
import { loginSchema } from "./auth.dto.js"
import * as authService from "./auth.service.js"

export async function login(req: Request, res: Response): Promise<void> {
  const input = loginSchema.parse(req.body)
  const result = await authService.login(input)
  res.json(result)
}

export async function me(req: Request, res: Response): Promise<void> {
  const user = await authService.getCurrentUser(req.user!.id)
  res.json({ user })
}
