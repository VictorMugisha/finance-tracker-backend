import { Prisma } from "../../generated/prisma/client.js"
import { prisma } from "../../shared/db/prisma.js"

const ZERO = new Prisma.Decimal(0)

const periodCountInclude = {
  _count: { select: { periods: true } },
} as const

async function list() {
  return prisma.recurringContribution.findMany({
    include: periodCountInclude,
    orderBy: { createdAt: "desc" },
  })
}

async function findById(id: string) {
  return prisma.recurringContribution.findUnique({
    where: { id },
    include: periodCountInclude,
  })
}

async function create(data: {
  title: string
  description: string | null
  period: "WEEKLY" | "MONTHLY" | "QUARTERLY"
  targetAmount: Prisma.Decimal
}) {
  return prisma.recurringContribution.create({
    data,
    include: periodCountInclude,
  })
}

async function update(
  id: string,
  data: {
    title?: string
    description?: string | null
    period?: "WEEKLY" | "MONTHLY" | "QUARTERLY"
    targetAmount?: Prisma.Decimal
  }
) {
  return prisma.recurringContribution.update({
    where: { id },
    data,
    include: periodCountInclude,
  })
}

async function setClosed(id: string, isClosed: boolean) {
  await prisma.recurringContribution.update({ where: { id }, data: { isClosed } })
}

async function getPeriods(recurringId: string) {
  return prisma.contribution.findMany({
    where: { recurringContributionId: recurringId },
    orderBy: { recurringPeriod: "asc" },
  })
}

async function findLatestPeriod(recurringId: string) {
  return prisma.contribution.findFirst({
    where: { recurringContributionId: recurringId },
    orderBy: { recurringPeriod: "desc" },
  })
}

async function createPeriod(data: {
  title: string
  description: string | null
  targetAmount: Prisma.Decimal | null
  recurringContributionId: string
  recurringPeriod: number
}) {
  return prisma.contribution.create({
    data: { ...data, type: "TARGETED", status: "OPEN" },
  })
}

async function getAssignmentsForPeriod(contributionId: string) {
  return prisma.contributionAssignment.findMany({ where: { contributionId } })
}

async function listActiveMembersByIds(ids: string[]) {
  return prisma.member.findMany({
    where: { id: { in: ids }, isActive: true },
    select: { id: true },
  })
}

async function createAssignments(
  contributionId: string,
  rows: { memberId: string; requiredAmount: Prisma.Decimal }[]
) {
  await prisma.contributionAssignment.createMany({
    data: rows.map((row) => ({
      contributionId,
      memberId: row.memberId,
      requiredAmount: row.requiredAmount,
    })),
  })
}

async function getAssignmentSumsByMember(contributionIds: string[]) {
  const grouped = await prisma.contributionAssignment.groupBy({
    by: ["memberId"],
    where: { contributionId: { in: contributionIds } },
    _sum: { requiredAmount: true },
  })
  return new Map(grouped.map((g) => [g.memberId, g._sum.requiredAmount ?? ZERO]))
}

async function getPaymentSumsByMember(contributionIds: string[]) {
  const grouped = await prisma.payment.groupBy({
    by: ["memberId"],
    where: { contributionId: { in: contributionIds } },
    _sum: { amount: true },
  })
  return new Map(grouped.map((g) => [g.memberId, g._sum.amount ?? ZERO]))
}

async function getMembersByIds(ids: string[]) {
  const members = await prisma.member.findMany({ where: { id: { in: ids } } })
  return new Map(members.map((m) => [m.id, m]))
}

export type RecurringRecord = NonNullable<Awaited<ReturnType<typeof findById>>>

export const recurringRepository = {
  list,
  findById,
  create,
  update,
  setClosed,
  getPeriods,
  findLatestPeriod,
  createPeriod,
  getAssignmentsForPeriod,
  listActiveMembersByIds,
  createAssignments,
  getAssignmentSumsByMember,
  getPaymentSumsByMember,
  getMembersByIds,
}
