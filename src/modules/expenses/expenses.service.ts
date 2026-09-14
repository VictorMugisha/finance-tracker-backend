import { Prisma } from "../../generated/prisma/client.js"
import { ApiError } from "../../shared/errors/api-error.js"
import type {
  CreateExpenseInput,
  ExpenseDto,
  ListExpensesQuery,
  UpdateExpenseInput,
} from "./expenses.dto.js"
import { expensesRepository, type ExpenseRecord } from "./expenses.repository.js"

function toExpenseDto(expense: ExpenseRecord): ExpenseDto {
  return {
    id: expense.id,
    contributionId: expense.contributionId,
    contributionTitle: expense.contribution?.title ?? null,
    type: expense.type,
    amount: expense.amount.toString(),
    recipientMemberId: expense.recipientMemberId,
    recipientMemberName: expense.recipientMember?.name ?? null,
    description: expense.description,
    spentAt: expense.spentAt.toISOString(),
    createdAt: expense.createdAt.toISOString(),
    updatedAt: expense.updatedAt.toISOString(),
  }
}

export async function list(filters: ListExpensesQuery): Promise<ExpenseDto[]> {
  const expenses = await expensesRepository.list(filters)
  return expenses.map(toExpenseDto)
}

export async function getById(id: string): Promise<ExpenseDto> {
  const expense = await expensesRepository.findById(id)
  if (!expense) {
    throw new ApiError(404, "Expense not found")
  }
  return toExpenseDto(expense)
}

export async function create(input: CreateExpenseInput): Promise<ExpenseDto> {
  if (input.contributionId) {
    const contribution = await expensesRepository.getContribution(input.contributionId)
    if (!contribution) {
      throw new ApiError(404, "Contribution not found")
    }
  }

  if (input.recipientMemberId) {
    const memberExists = await expensesRepository.memberExists(input.recipientMemberId)
    if (!memberExists) {
      throw new ApiError(404, "Recipient member not found")
    }
  }

  const expense = await expensesRepository.create({
    contributionId: input.contributionId ?? null,
    type: input.type,
    amount: new Prisma.Decimal(input.amount),
    recipientMemberId: input.recipientMemberId ?? null,
    description: input.description ?? null,
    spentAt: input.spentAt ?? undefined,
  })

  return toExpenseDto(expense)
}

export async function update(id: string, input: UpdateExpenseInput): Promise<ExpenseDto> {
  const existing = await expensesRepository.findById(id)
  if (!existing) {
    throw new ApiError(404, "Expense not found")
  }

  const hasChanges = [
    input.contributionId,
    input.type,
    input.amount,
    input.recipientMemberId,
    input.description,
    input.spentAt,
  ].some((value) => value !== undefined)
  if (!hasChanges) {
    throw new ApiError(400, "No fields to update")
  }

  if (input.contributionId) {
    const contribution = await expensesRepository.getContribution(input.contributionId)
    if (!contribution) {
      throw new ApiError(404, "Contribution not found")
    }
  }

  if (input.recipientMemberId) {
    const memberExists = await expensesRepository.memberExists(input.recipientMemberId)
    if (!memberExists) {
      throw new ApiError(404, "Recipient member not found")
    }
  }

  const expense = await expensesRepository.update(id, {
    contributionId: input.contributionId,
    type: input.type,
    amount: input.amount != null ? new Prisma.Decimal(input.amount) : undefined,
    recipientMemberId: input.recipientMemberId,
    description: input.description,
    spentAt: input.spentAt,
  })

  return toExpenseDto(expense)
}
