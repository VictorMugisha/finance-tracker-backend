import type { Request, Response } from "express"
import { sendSuccess } from "../../shared/http/response.js"
import { createUserSchema, setPermissionsSchema, updateUserSchema } from "./users.dto.js"
import * as usersService from "./users.service.js"

export async function list(_req: Request, res: Response): Promise<void> {
  const users = await usersService.list()
  sendSuccess(res, 200, "Users fetched successfully", users)
}

export async function getById(req: Request<{ id: string }>, res: Response): Promise<void> {
  const user = await usersService.getById(req.params.id)
  sendSuccess(res, 200, "User fetched successfully", user)
}

export async function create(req: Request, res: Response): Promise<void> {
  const input = createUserSchema.parse(req.body)
  const user = await usersService.create(input)
  sendSuccess(res, 201, "User created successfully", user)
}

export async function update(req: Request<{ id: string }>, res: Response): Promise<void> {
  const input = updateUserSchema.parse(req.body)
  const user = await usersService.update(req.params.id, input)
  sendSuccess(res, 200, "User updated successfully", user)
}

export async function setPermissions(req: Request<{ id: string }>, res: Response): Promise<void> {
  const input = setPermissionsSchema.parse(req.body)
  const user = await usersService.setPermissions(req.params.id, input)
  sendSuccess(res, 200, "Permissions updated successfully", user)
}
