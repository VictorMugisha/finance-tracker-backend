import type { Request, Response } from "express"
import { sendSuccess } from "../../shared/http/response.js"
import { createMemberSchema, listMembersQuerySchema, updateMemberSchema } from "./members.dto.js"
import * as membersService from "./members.service.js"

export async function list(req: Request, res: Response): Promise<void> {
  const { search } = listMembersQuerySchema.parse(req.query)
  const members = await membersService.list(search)
  sendSuccess(res, 200, "Members fetched successfully", members)
}

export async function getById(req: Request<{ id: string }>, res: Response): Promise<void> {
  const member = await membersService.getById(req.params.id)
  sendSuccess(res, 200, "Member fetched successfully", member)
}

export async function create(req: Request, res: Response): Promise<void> {
  const input = createMemberSchema.parse(req.body)
  const member = await membersService.create(input)
  sendSuccess(res, 201, "Member created successfully", member)
}

export async function update(req: Request<{ id: string }>, res: Response): Promise<void> {
  const input = updateMemberSchema.parse(req.body)
  const member = await membersService.update(req.params.id, input)
  sendSuccess(res, 200, "Member updated successfully", member)
}

export async function remove(req: Request<{ id: string }>, res: Response): Promise<void> {
  const member = await membersService.deactivate(req.params.id)
  sendSuccess(res, 200, "Member deactivated successfully", member)
}
