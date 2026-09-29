import { Prisma } from "../../generated/prisma/client.js"
import { ApiError } from "../../shared/errors/api-error.js"
import * as contributionsService from "../contributions/contributions.service.js"
import type {
  CreateRecurringInput,
  RecurringContributionDetailResponse,
  RecurringContributionDto,
  RecurringMemberReportItem,
  RecurringPeriodSummary,
  RecurringReportResponse,
  RolloverInput,
  RolloverResult,
  UpdateRecurringInput,
} from "./recurring-contributions.dto.js"
import {
  recurringRepository,
  type RecurringRecord,
} from "./recurring-contributions.repository.js"

const ZERO = new Prisma.Decimal(0)

function toRecurringDto(recurring: RecurringRecord): RecurringContributionDto {
  return {
    id: recurring.id,
    title: recurring.title,
    description: recurring.description,
    period: recurring.period,
    targetAmount: recurring.targetAmount?.toString() ?? null,
    isClosed: recurring.isClosed,
    createdAt: recurring.createdAt.toISOString(),
    periodCount: recurring._count.periods,
  }
}

export async function list(): Promise<RecurringContributionDto[]> {
  const items = await recurringRepository.list()
  return items.map(toRecurringDto)
}

export async function create(input: CreateRecurringInput): Promise<RecurringContributionDto> {
  const targetAmount = new Prisma.Decimal(input.targetAmount)

  const recurring = await recurringRepository.create({
    title: input.title,
    description: input.description ?? null,
    period: input.period,
    targetAmount,
  })

  await recurringRepository.createPeriod({
    title: input.title,
    description: input.description ?? null,
    targetAmount,
    recurringContributionId: recurring.id,
    recurringPeriod: 1,
    periodLabel: null,
  })

  return { ...toRecurringDto(recurring), periodCount: 1 }
}

export async function getById(id: string): Promise<RecurringContributionDetailResponse> {
  const recurring = await recurringRepository.findById(id)
  if (!recurring) {
    throw new ApiError(404, "Recurring contribution not found")
  }

  const periods = await recurringRepository.getPeriods(id)
  const periodDtos = await Promise.all(periods.map((period) => contributionsService.getById(period.id)))

  return { recurring: toRecurringDto(recurring), periods: periodDtos }
}

export async function update(id: string, input: UpdateRecurringInput): Promise<RecurringContributionDto> {
  const existing = await recurringRepository.findById(id)
  if (!existing) {
    throw new ApiError(404, "Recurring contribution not found")
  }

  const hasChanges = [input.title, input.description, input.period, input.targetAmount].some(
    (value) => value !== undefined
  )
  if (!hasChanges) {
    throw new ApiError(400, "No fields to update")
  }

  const updated = await recurringRepository.update(id, {
    title: input.title,
    description: input.description,
    period: input.period,
    targetAmount: input.targetAmount != null ? new Prisma.Decimal(input.targetAmount) : undefined,
  })

  return toRecurringDto(updated)
}

export async function rollover(id: string, input: RolloverInput): Promise<RolloverResult> {
  const recurring = await recurringRepository.findById(id)
  if (!recurring) {
    throw new ApiError(404, "Recurring contribution not found")
  }
  if (recurring.isClosed) {
    throw new ApiError(400, "Recurring contribution is closed")
  }

  const latest = await recurringRepository.findLatestPeriod(id)
  const nextPeriod = (latest?.recurringPeriod ?? 0) + 1

  const newPeriod = await recurringRepository.createPeriod({
    title: recurring.title,
    description: recurring.description,
    targetAmount: recurring.targetAmount,
    recurringContributionId: id,
    recurringPeriod: nextPeriod,
    periodLabel: input.label?.trim() ? input.label.trim() : null,
  })

  let assigned = 0
  if (latest) {
    const assignments = await recurringRepository.getAssignmentsForPeriod(latest.id)
    if (assignments.length > 0) {
      const memberIds = [...new Set(assignments.map((assignment) => assignment.memberId))]
      const activeMembers = await recurringRepository.listActiveMembersByIds(memberIds)
      const activeSet = new Set(activeMembers.map((member) => member.id))

      const rows = assignments
        .filter((assignment) => activeSet.has(assignment.memberId))
        .map((assignment) => ({
          memberId: assignment.memberId,
          requiredAmount: assignment.requiredAmount,
        }))

      if (rows.length > 0) {
        await recurringRepository.createAssignments(newPeriod.id, rows)
        assigned = rows.length
      }
    }
  }

  return { id: newPeriod.id, period: nextPeriod, assigned }
}

export async function close(id: string): Promise<RecurringContributionDto> {
  const existing = await recurringRepository.findById(id)
  if (!existing) {
    throw new ApiError(404, "Recurring contribution not found")
  }

  await recurringRepository.setClosed(id, true)
  const updated = await recurringRepository.findById(id)
  return toRecurringDto(updated!)
}

export async function reopen(id: string): Promise<RecurringContributionDto> {
  const existing = await recurringRepository.findById(id)
  if (!existing) {
    throw new ApiError(404, "Recurring contribution not found")
  }
  if (!existing.isClosed) {
    throw new ApiError(400, "Recurring contribution is not closed")
  }

  await recurringRepository.setClosed(id, false)
  const updated = await recurringRepository.findById(id)
  return toRecurringDto(updated!)
}

export async function report(id: string): Promise<RecurringReportResponse> {
  const recurring = await recurringRepository.findById(id)
  if (!recurring) {
    throw new ApiError(404, "Recurring contribution not found")
  }

  const periods = await recurringRepository.getPeriods(id)
  const periodDtos = await Promise.all(periods.map((period) => contributionsService.getById(period.id)))

  const summaries: RecurringPeriodSummary[] = periodDtos.map((dto, index) => ({
    id: dto.id,
    period: periods[index]?.recurringPeriod ?? 0,
    status: dto.status,
    createdAt: dto.createdAt,
    totalRequired: dto.totalRequired,
    totalCollected: dto.totalCollected,
    totalDisbursed: dto.totalDisbursed,
    net: dto.net,
  }))

  const periodIds = periods.map((period) => period.id)
  const [assignmentSums, paymentSums] = await Promise.all([
    recurringRepository.getAssignmentSumsByMember(periodIds),
    recurringRepository.getPaymentSumsByMember(periodIds),
  ])

  const memberIds = new Set<string>([...assignmentSums.keys(), ...paymentSums.keys()])
  const members = await recurringRepository.getMembersByIds([...memberIds])

  const items: RecurringMemberReportItem[] = [...memberIds].map((memberId) => {
    const member = members.get(memberId)
    const required = assignmentSums.get(memberId) ?? ZERO
    const paid = paymentSums.get(memberId) ?? ZERO
    return {
      memberId,
      name: member?.name ?? "Unknown",
      phone: member?.phone ?? null,
      isActive: member?.isActive ?? false,
      totalRequired: required.toString(),
      totalPaid: paid.toString(),
      balance: paid.minus(required).toString(),
    }
  })
  items.sort((a, b) => a.name.localeCompare(b.name))

  return { recurring: toRecurringDto(recurring), periods: summaries, members: items }
}
