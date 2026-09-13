import type { Request, Response } from "express"
import { sendSuccess } from "../../shared/http/response.js"
import {
  createPaymentSchema,
  listPaymentsQuerySchema,
  updatePaymentSchema,
} from "./payments.dto.js"
import * as paymentsService from "./payments.service.js"

export async function list(req: Request, res: Response): Promise<void> {
  const query = listPaymentsQuerySchema.parse(req.query)
  const payments = await paymentsService.list(query)
  sendSuccess(res, 200, "Payments fetched successfully", payments)
}

export async function create(req: Request, res: Response): Promise<void> {
  const input = createPaymentSchema.parse(req.body)
  const payment = await paymentsService.create(input)
  sendSuccess(res, 201, "Payment recorded successfully", payment)
}

export async function update(req: Request<{ id: string }>, res: Response): Promise<void> {
  const input = updatePaymentSchema.parse(req.body)
  const payment = await paymentsService.update(req.params.id, input)
  sendSuccess(res, 200, "Payment updated successfully", payment)
}
