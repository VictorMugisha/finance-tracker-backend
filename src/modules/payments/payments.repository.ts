import { Prisma } from "../../generated/prisma/client.js"
import { prisma } from "../../shared/db/prisma.js"

const relations = { contribution: true, member: true } as const

async function getContribution(contributionId: string) {
  return prisma.contribution.findUnique({ where: { id: contributionId } })
}

async function memberExists(memberId: string) {
  const member = await prisma.member.findUnique({ where: { id: memberId }, select: { id: true } })
  return member !== null
}

async function list(filters: { contributionId?: string; memberId?: string }) {
  return prisma.payment.findMany({
    where: {
      ...(filters.contributionId ? { contributionId: filters.contributionId } : {}),
      ...(filters.memberId ? { memberId: filters.memberId } : {}),
    },
    include: relations,
    orderBy: { paidAt: "desc" },
  })
}

async function findById(id: string) {
  return prisma.payment.findUnique({
    where: { id },
    include: relations,
  })
}

async function create(data: {
  contributionId: string
  memberId: string
  amount: Prisma.Decimal
  note: string | null
  paidAt?: string | Date
}) {
  return prisma.payment.create({
    data,
    include: relations,
  })
}

async function update(
  id: string,
  data: {
    amount?: Prisma.Decimal
    note?: string | null
    paidAt?: string
  }
) {
  return prisma.payment.update({
    where: { id },
    data,
    include: relations,
  })
}

export type PaymentRecord = NonNullable<Awaited<ReturnType<typeof findById>>>

export const paymentsRepository = {
  getContribution,
  memberExists,
  list,
  findById,
  create,
  update,
}
