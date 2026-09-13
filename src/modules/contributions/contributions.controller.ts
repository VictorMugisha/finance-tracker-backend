import type { Request, Response } from "express"
import { sendSuccess } from "../../shared/http/response.js"
import {
  createContributionSchema,
  listContributionsQuerySchema,
  updateContributionSchema,
} from "./contributions.dto.js"
import * as contributionsService from "./contributions.service.js"

export async function balance(_req: Request, res: Response): Promise<void> {
  const result = await contributionsService.getGroupBalance()
  sendSuccess(res, 200, "Group balance fetched successfully", result)
}

export async function list(req: Request, res: Response): Promise<void> {
  const query = listContributionsQuerySchema.parse(req.query)
  const contributions = await contributionsService.list(query)
  sendSuccess(res, 200, "Contributions fetched successfully", contributions)
}

export async function getById(req: Request<{ id: string }>, res: Response): Promise<void> {
  const contribution = await contributionsService.getById(req.params.id)
  sendSuccess(res, 200, "Contribution fetched successfully", contribution)
}

export async function create(req: Request, res: Response): Promise<void> {
  const input = createContributionSchema.parse(req.body)
  const contribution = await contributionsService.create(input)
  sendSuccess(res, 201, "Contribution created successfully", contribution)
}

export async function update(req: Request<{ id: string }>, res: Response): Promise<void> {
  const input = updateContributionSchema.parse(req.body)
  const contribution = await contributionsService.update(req.params.id, input)
  sendSuccess(res, 200, "Contribution updated successfully", contribution)
}

export async function close(req: Request<{ id: string }>, res: Response): Promise<void> {
  const contribution = await contributionsService.close(req.params.id)
  sendSuccess(res, 200, "Contribution closed successfully", contribution)
}

export async function report(req: Request<{ id: string }>, res: Response): Promise<void> {
  const result = await contributionsService.getReport(req.params.id)
  sendSuccess(res, 200, "Contribution report generated", result)
}
