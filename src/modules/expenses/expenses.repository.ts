import { Prisma } from "../../generated/prisma/client.js"
import { prisma } from "../../shared/db/prisma.js"

const relations = { contribution: true, recipientMember: true } as const

type ExpenseTypeValue = "HANDOVER" | "MEMBER_SUPPORT" | "LEISURE" | "OTHER"

async function getContribution(contributionId: string) {
  return prisma.contribution.findUnique({ where: { id: contributionId } })
}

async function memberExists(memberId: string) {
  const member = await prisma.member.findUnique({ where: { id: memberId }, select: { id: true } })
  return member !== null
}

async function list(filters: {
  contributionId?: string
  type?: ExpenseTypeValue
  recipientMemberId?: string
}) {
  return prisma.expense.findMany({
    where: {
      ...(filters.contributionId ? { contributionId: filters.contributionId } : {}),
      ...(filters.type ? { type: filters.type } : {}),
      ...(filters.recipientMemberId ? { recipientMemberId: filters.recipientMemberId } : {}),
    },
    include: relations,
    orderBy: { spentAt: "desc" },
  })
}

async function findById(id: string) {
  return prisma.expense.findUnique({
    where: { id },
    include: relations,
  })
}

async function create(data: {
  contributionId: string | null
  type: ExpenseTypeValue
  amount: Prisma.Decimal
  recipientMemberId: string | null
  description: string | null
  spentAt?: string | Date
}) {
  return prisma.expense.create({
    data,
    include: relations,
  })
}

async function update(
  id: string,
  data: {
    contributionId?: string | null
    type?: ExpenseTypeValue
    amount?: Prisma.Decimal
    recipientMemberId?: string | null
    description?: string | null
    spentAt?: string
  }
) {
  return prisma.expense.update({
    where: { id },
    data,
    include: relations,
  })
}

export type ExpenseRecord = NonNullable<Awaited<ReturnType<typeof findById>>>

export const expensesRepository = {
  getContribution,
  memberExists,
  list,
  findById,
  create,
  update,
}
