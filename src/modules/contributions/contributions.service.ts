import { Prisma } from "../../generated/prisma/client.js"
import { ApiError } from "../../shared/errors/api-error.js"
import type {
  ContributionDto,
  ContributionReportResponse,
  CreateContributionInput,
  GroupBalanceResponse,
  ListContributionsQuery,
  UpdateContributionInput,
} from "./contributions.dto.js"
import { contributionsRepository, type ContributionRecord } from "./contributions.repository.js"

const ZERO = new Prisma.Decimal(0)

function toContributionDto(
  contribution: ContributionRecord,
  totalCollected: Prisma.Decimal,
  totalRequired: Prisma.Decimal,
  totalDisbursed: Prisma.Decimal
): ContributionDto {
  return {
    id: contribution.id,
    title: contribution.title,
    description: contribution.description,
    type: contribution.type,
    targetAmount: contribution.targetAmount?.toString() ?? null,
    deadline: contribution.deadline?.toISOString() ?? null,
    status: contribution.status,
    createdAt: contribution.createdAt.toISOString(),
    totalCollected: totalCollected.toString(),
    totalRequired: totalRequired.toString(),
    net: totalCollected.minus(totalDisbursed).toString(),
  }
}

async function getTotals(contributionIds: string[]) {
  const [paymentSums, assignmentSums, expenseSums] = await Promise.all([
    contributionsRepository.getPaymentSums(contributionIds),
    contributionsRepository.getAssignmentSums(contributionIds),
    contributionsRepository.getExpenseSums(contributionIds),
  ])
  return { paymentSums, assignmentSums, expenseSums }
}

export async function list(filters: ListContributionsQuery): Promise<ContributionDto[]> {
  const contributions = await contributionsRepository.list(filters)
  if (contributions.length === 0) {
    return []
  }

  const ids = contributions.map((contribution) => contribution.id)
  const { paymentSums, assignmentSums, expenseSums } = await getTotals(ids)

  return contributions.map((contribution) =>
    toContributionDto(
      contribution,
      paymentSums.get(contribution.id) ?? ZERO,
      contribution.type === "TARGETED" ? (assignmentSums.get(contribution.id) ?? ZERO) : ZERO,
      expenseSums.get(contribution.id) ?? ZERO
    )
  )
}

export async function getById(id: string): Promise<ContributionDto> {
  const contribution = await contributionsRepository.findById(id)
  if (!contribution) {
    throw new ApiError(404, "Contribution not found")
  }

  const { paymentSums, assignmentSums, expenseSums } = await getTotals([id])

  return toContributionDto(
    contribution,
    paymentSums.get(id) ?? ZERO,
    contribution.type === "TARGETED" ? (assignmentSums.get(id) ?? ZERO) : ZERO,
    expenseSums.get(id) ?? ZERO
  )
}

export async function create(input: CreateContributionInput): Promise<ContributionDto> {
  const contribution = await contributionsRepository.create({
    title: input.title,
    description: input.description ?? null,
    type: input.type,
    targetAmount: input.targetAmount != null ? new Prisma.Decimal(input.targetAmount) : null,
    deadline: input.deadline ?? null,
  })

  return toContributionDto(contribution, ZERO, ZERO, ZERO)
}

export async function update(id: string, input: UpdateContributionInput): Promise<ContributionDto> {
  const existing = await contributionsRepository.findById(id)
  if (!existing) {
    throw new ApiError(404, "Contribution not found")
  }

  const hasChanges = [input.title, input.description, input.targetAmount, input.deadline].some(
    (value) => value !== undefined
  )
  if (!hasChanges) {
    throw new ApiError(400, "No fields to update")
  }

  let targetAmount: Prisma.Decimal | null | undefined
  if (input.targetAmount !== undefined) {
    if (existing.type === "OPEN" && input.targetAmount !== null) {
      throw new ApiError(400, "An OPEN contribution cannot have a target amount")
    }
    if (existing.type === "TARGETED" && input.targetAmount === null) {
      throw new ApiError(400, "A TARGETED contribution requires a target amount")
    }
    targetAmount = input.targetAmount != null ? new Prisma.Decimal(input.targetAmount) : null
  }

  await contributionsRepository.update(id, {
    title: input.title,
    description: input.description,
    targetAmount,
    deadline: input.deadline,
  })

  return getById(id)
}

export async function close(id: string): Promise<ContributionDto> {
  const existing = await contributionsRepository.findById(id)
  if (!existing) {
    throw new ApiError(404, "Contribution not found")
  }

  await contributionsRepository.close(id)
  return getById(id)
}

export async function getReport(id: string): Promise<ContributionReportResponse> {
  const contribution = await contributionsRepository.findById(id)
  if (!contribution) {
    throw new ApiError(404, "Contribution not found")
  }

  const { paymentSums, assignmentSums, expenseSums } = await getTotals([id])
  const dto = toContributionDto(
    contribution,
    paymentSums.get(id) ?? ZERO,
    contribution.type === "TARGETED" ? (assignmentSums.get(id) ?? ZERO) : ZERO,
    expenseSums.get(id) ?? ZERO
  )

  const paymentSumsByMember = await contributionsRepository.getPaymentSumsByMember(id)
  const memberIds = new Set<string>(paymentSumsByMember.keys())

  if (contribution.type === "TARGETED") {
    const assignments = await contributionsRepository.getAssignmentsWithMember(id)
    const assignmentByMember = new Map(
      assignments.map((assignment) => [assignment.memberId, assignment])
    )
    for (const assignment of assignments) {
      memberIds.add(assignment.memberId)
    }

    const members = await contributionsRepository.getMembersByIds([...memberIds])

    const items = [...memberIds].map((memberId) => {
      const member = members.get(memberId)
      const assignment = assignmentByMember.get(memberId)
      const required = assignment?.requiredAmount ?? ZERO
      const paid = paymentSumsByMember.get(memberId) ?? ZERO
      return {
        memberId,
        name: member?.name ?? "Unknown",
        phone: member?.phone ?? null,
        required: required.toString(),
        paid: paid.toString(),
        balance: paid.minus(required).toString(),
      }
    })

    return { contribution: dto, members: items }
  }

  const members = await contributionsRepository.getMembersByIds([...memberIds])
  const items = [...memberIds].map((memberId) => {
    const member = members.get(memberId)
    return {
      memberId,
      name: member?.name ?? "Unknown",
      phone: member?.phone ?? null,
      totalPaid: (paymentSumsByMember.get(memberId) ?? ZERO).toString(),
    }
  })

  return { contribution: dto, members: items }
}

export async function getGroupBalance(): Promise<GroupBalanceResponse> {
  const { totalCollected, totalDisbursed } = await contributionsRepository.getGlobalTotals()
  return {
    totalCollected: totalCollected.toString(),
    totalDisbursed: totalDisbursed.toString(),
    balance: totalCollected.minus(totalDisbursed).toString(),
  }
}
