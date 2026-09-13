import { prisma } from "../../shared/db/prisma.js"

const userInclude = {
  member: true,
  permissions: { include: { permission: true } },
} as const

async function findByPhone(phone: string) {
  return prisma.user.findUnique({
    where: { phone },
    include: userInclude,
  })
}

async function findById(id: string) {
  return prisma.user.findUnique({
    where: { id },
    include: userInclude,
  })
}

export type UserWithPermissions = NonNullable<Awaited<ReturnType<typeof findByPhone>>>

export const authRepository = {
  findByPhone,
  findById,
}
