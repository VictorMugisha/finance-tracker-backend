import { Prisma } from "../../generated/prisma/client.js"
import { prisma } from "../../shared/db/prisma.js"

const ZERO = new Prisma.Decimal(0)

async function findById(id: string) {
  return prisma.contribution.findUnique({ where: { id } })
}

async function list(filters: {
  type?: "TARGETED" | "OPEN"
  status?: "OPEN" | "CLOSED"
  search?: string
}) {
  return prisma.contribution.findMany({
    where: {
      ...(filters.type ? { type: filters.type } : {}),
      ...(filters.status ? { status: filters.status } : {}),
      ...(filters.search ? { title: { contains: filters.search, mode: "insensitive" } } : {}),
    },
    orderBy: { createdAt: "desc" },
  })
}

async function create(data: {
  title: string
  description: string | null
  type: "TARGETED" | "OPEN"
  targetAmount: Prisma.Decimal | null
  deadline: string | null
}) {
  return prisma.contribution.create({ data })
}

async function update(
  id: string,
  data: {
    title?: string
    description?: string | null
    targetAmount?: Prisma.Decimal | null
    deadline?: string | null
  }
) {
  return prisma.contribution.update({ where: { id }, data })
}

async function close(id: string) {
  return prisma.contribution.update({ where: { id }, data: { status: "CLOSED" } })
}

async function getPaymentSums(contributionIds: string[]) {
  const grouped = await prisma.payment.groupBy({
    by: ["contributionId"],
    where: { contributionId: { in: contributionIds } },
    _sum: { amount: true },
  })
  return new Map(grouped.map((g) => [g.contributionId, g._sum.amount ?? ZERO]))
}

async function getAssignmentSums(contributionIds: string[]) {
  const grouped = await prisma.contributionAssignment.groupBy({
    by: ["contributionId"],
    where: { contributionId: { in: contributionIds } },
    _sum: { requiredAmount: true },
  })
  return new Map(grouped.map((g) => [g.contributionId, g._sum.requiredAmount ?? ZERO]))
}

async function getExpenseSums(contributionIds: string[]) {
  const grouped = await prisma.expense.groupBy({
    by: ["contributionId"],
    where: { contributionId: { in: contributionIds } },
    _sum: { amount: true },
  })
  return new Map(grouped.map((g) => [g.contributionId ?? "", g._sum.amount ?? ZERO]))
}

async function getPaymentSumsByMember(contributionId: string) {
  const grouped = await prisma.payment.groupBy({
    by: ["memberId"],
    where: { contributionId },
    _sum: { amount: true },
  })
  return new Map(grouped.map((g) => [g.memberId, g._sum.amount ?? ZERO]))
}

async function getAssignmentsWithMember(contributionId: string) {
  return prisma.contributionAssignment.findMany({
    where: { contributionId },
    include: { member: true },
  })
}

async function getMembersByIds(ids: string[]) {
  const members = await prisma.member.findMany({ where: { id: { in: ids } } })
  return new Map(members.map((m) => [m.id, m]))
}

async function getGlobalTotals() {
  const [payments, expenses] = await Promise.all([
    prisma.payment.aggregate({ _sum: { amount: true } }),
    prisma.expense.aggregate({ _sum: { amount: true } }),
  ])
  return {
    totalCollected: payments._sum.amount ?? ZERO,
    totalDisbursed: expenses._sum.amount ?? ZERO,
  }
}

export type ContributionRecord = NonNullable<Awaited<ReturnType<typeof findById>>>

export const contributionsRepository = {
  findById,
  list,
  create,
  update,
  close,
  getPaymentSums,
  getAssignmentSums,
  getExpenseSums,
  getPaymentSumsByMember,
  getAssignmentsWithMember,
  getMembersByIds,
  getGlobalTotals,
}
