import { Prisma } from "../../generated/prisma/client.js"
import { ApiError } from "../../shared/errors/api-error.js"
import type {
  CreatePaymentInput,
  ListPaymentsQuery,
  PaymentDto,
  UpdatePaymentInput,
} from "./payments.dto.js"
import { paymentsRepository, type PaymentRecord } from "./payments.repository.js"

function toPaymentDto(payment: PaymentRecord): PaymentDto {
  return {
    id: payment.id,
    contributionId: payment.contributionId,
    contributionTitle: payment.contribution.title,
    memberId: payment.memberId,
    memberName: payment.member.name,
    amount: payment.amount.toString(),
    paidAt: payment.paidAt.toISOString(),
    note: payment.note,
    createdAt: payment.createdAt.toISOString(),
    updatedAt: payment.updatedAt.toISOString(),
  }
}

export async function list(filters: ListPaymentsQuery): Promise<PaymentDto[]> {
  const payments = await paymentsRepository.list(filters)
  return payments.map(toPaymentDto)
}

export async function create(input: CreatePaymentInput): Promise<PaymentDto> {
  const contribution = await paymentsRepository.getContribution(input.contributionId)
  if (!contribution) {
    throw new ApiError(404, "Contribution not found")
  }

  const memberExists = await paymentsRepository.memberExists(input.memberId)
  if (!memberExists) {
    throw new ApiError(404, "Member not found")
  }

  const payment = await paymentsRepository.create({
    contributionId: input.contributionId,
    memberId: input.memberId,
    amount: new Prisma.Decimal(input.amount),
    note: input.note ?? null,
    paidAt: input.paidAt ?? undefined,
  })

  return toPaymentDto(payment)
}

export async function update(id: string, input: UpdatePaymentInput): Promise<PaymentDto> {
  const existing = await paymentsRepository.findById(id)
  if (!existing) {
    throw new ApiError(404, "Payment not found")
  }

  const hasChanges = [input.amount, input.note, input.paidAt].some((value) => value !== undefined)
  if (!hasChanges) {
    throw new ApiError(400, "No fields to update")
  }

  const payment = await paymentsRepository.update(id, {
    amount: input.amount != null ? new Prisma.Decimal(input.amount) : undefined,
    note: input.note,
    paidAt: input.paidAt,
  })

  return toPaymentDto(payment)
}
