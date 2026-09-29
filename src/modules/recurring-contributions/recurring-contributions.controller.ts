import type { Request, Response } from "express"
import { sendSuccess } from "../../shared/http/response.js"
import { createRecurringSchema, rolloverSchema, updateRecurringSchema } from "./recurring-contributions.dto.js"
import * as recurringService from "./recurring-contributions.service.js"

export async function list(_req: Request, res: Response): Promise<void> {
  const items = await recurringService.list()
  sendSuccess(res, 200, "Recurring contributions fetched successfully", items)
}

export async function getById(req: Request<{ id: string }>, res: Response): Promise<void> {
  const result = await recurringService.getById(req.params.id)
  sendSuccess(res, 200, "Recurring contribution fetched successfully", result)
}

export async function create(req: Request, res: Response): Promise<void> {
  const input = createRecurringSchema.parse(req.body)
  const recurring = await recurringService.create(input)
  sendSuccess(res, 201, "Recurring contribution created successfully", recurring)
}

export async function update(req: Request<{ id: string }>, res: Response): Promise<void> {
  const input = updateRecurringSchema.parse(req.body)
  const recurring = await recurringService.update(req.params.id, input)
  sendSuccess(res, 200, "Recurring contribution updated successfully", recurring)
}

export async function rollover(req: Request<{ id: string }>, res: Response): Promise<void> {
  const input = rolloverSchema.parse(req.body ?? {})
  const result = await recurringService.rollover(req.params.id, input)
  sendSuccess(res, 201, "New period created successfully", result)
}

export async function close(req: Request<{ id: string }>, res: Response): Promise<void> {
  const recurring = await recurringService.close(req.params.id)
  sendSuccess(res, 200, "Recurring contribution closed successfully", recurring)
}

export async function reopen(req: Request<{ id: string }>, res: Response): Promise<void> {
  const recurring = await recurringService.reopen(req.params.id)
  sendSuccess(res, 200, "Recurring contribution reopened successfully", recurring)
}

export async function report(req: Request<{ id: string }>, res: Response): Promise<void> {
  const result = await recurringService.report(req.params.id)
  sendSuccess(res, 200, "Recurring report generated", result)
}
