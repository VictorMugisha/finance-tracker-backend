import { Prisma } from "../../generated/prisma/client.js"
import { prisma } from "../../shared/db/prisma.js"

const memberInclude = { member: true } as const

async function getContribution(contributionId: string) {
  return prisma.contribution.findUnique({ where: { id: contributionId } })
}

async function memberExists(memberId: string) {
  const member = await prisma.member.findUnique({ where: { id: memberId }, select: { id: true } })
  return member !== null
}

async function listByContribution(contributionId: string) {
  return prisma.contributionAssignment.findMany({
    where: { contributionId },
    include: memberInclude,
    orderBy: { memberId: "asc" },
  })
}

async function findById(id: string) {
  return prisma.contributionAssignment.findUnique({
    where: { id },
    include: memberInclude,
  })
}

async function findByContributionAndMember(contributionId: string, memberId: string) {
  return prisma.contributionAssignment.findUnique({
    where: { contributionId_memberId: { contributionId, memberId } },
  })
}

async function create(data: {
  contributionId: string
  memberId: string
  requiredAmount: Prisma.Decimal
}) {
  return prisma.contributionAssignment.create({
    data,
    include: memberInclude,
  })
}

async function update(id: string, data: { requiredAmount: Prisma.Decimal }) {
  return prisma.contributionAssignment.update({
    where: { id },
    data,
    include: memberInclude,
  })
}

async function remove(id: string) {
  return prisma.contributionAssignment.delete({
    where: { id },
    include: memberInclude,
  })
}

export type AssignmentRecord = NonNullable<Awaited<ReturnType<typeof findById>>>

export const assignmentsRepository = {
  getContribution,
  memberExists,
  listByContribution,
  findById,
  findByContributionAndMember,
  create,
  update,
  remove,
}
