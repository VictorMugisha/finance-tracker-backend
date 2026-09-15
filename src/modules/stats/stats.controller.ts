import type { Request, Response } from "express"
import { sendSuccess } from "../../shared/http/response.js"
import * as statsService from "./stats.service.js"

export async function getStats(_req: Request, res: Response): Promise<void> {
  const stats = await statsService.getStats()
  sendSuccess(res, 200, "Stats fetched successfully", stats)
}
