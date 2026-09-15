import type { Request, Response } from "express"
import { sendSuccess } from "../../shared/http/response.js"
import * as permissionsService from "./permissions.service.js"

export async function list(_req: Request, res: Response): Promise<void> {
  const permissions = await permissionsService.list()
  sendSuccess(res, 200, "Permissions fetched successfully", permissions)
}
