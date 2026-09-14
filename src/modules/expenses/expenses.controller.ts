import type { Request, Response } from "express"
import { sendSuccess } from "../../shared/http/response.js"
import {
  createExpenseSchema,
  listExpensesQuerySchema,
  updateExpenseSchema,
} from "./expenses.dto.js"
import * as expensesService from "./expenses.service.js"

export async function list(req: Request, res: Response): Promise<void> {
  const query = listExpensesQuerySchema.parse(req.query)
  const expenses = await expensesService.list(query)
  sendSuccess(res, 200, "Expenses fetched successfully", expenses)
}

export async function getById(req: Request<{ id: string }>, res: Response): Promise<void> {
  const expense = await expensesService.getById(req.params.id)
  sendSuccess(res, 200, "Expense fetched successfully", expense)
}

export async function create(req: Request, res: Response): Promise<void> {
  const input = createExpenseSchema.parse(req.body)
  const expense = await expensesService.create(input)
  sendSuccess(res, 201, "Expense recorded successfully", expense)
}

export async function update(req: Request<{ id: string }>, res: Response): Promise<void> {
  const input = updateExpenseSchema.parse(req.body)
  const expense = await expensesService.update(req.params.id, input)
  sendSuccess(res, 200, "Expense updated successfully", expense)
}
