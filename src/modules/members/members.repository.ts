import { prisma } from "../../shared/db/prisma.js"
import type { GroupRoleValue } from "./members.dto.js"

const memberInclude = {
  user: true,
} as const

async function list(search?: string) {
  return prisma.member.findMany({
    where: search ? { name: { contains: search, mode: "insensitive" } } : undefined,
    include: memberInclude,
    orderBy: { createdAt: "desc" },
  })
}

async function findById(id: string) {
  return prisma.member.findUnique({
    where: { id },
    include: memberInclude,
  })
}

async function create(data: { name: string; phone: string | null; role: GroupRoleValue | null }) {
  return prisma.member.create({
    data,
    include: memberInclude,
  })
}

async function update(
  id: string,
  data: {
    name?: string
    phone?: string | null
    role?: GroupRoleValue | null
    isActive?: boolean
  }
) {
  return prisma.member.update({
    where: { id },
    data,
    include: memberInclude,
  })
}

async function deactivate(id: string) {
  return prisma.member.update({
    where: { id },
    data: { isActive: false },
    include: memberInclude,
  })
}

export type MemberRecord = NonNullable<Awaited<ReturnType<typeof findById>>>

export const membersRepository = {
  list,
  findById,
  create,
  update,
  deactivate,
}
