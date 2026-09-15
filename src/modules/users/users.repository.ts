import { prisma } from "../../shared/db/prisma.js"

const userInclude = {
  member: true,
  permissions: { include: { permission: true } },
} as const

async function list() {
  return prisma.user.findMany({
    include: userInclude,
    orderBy: { createdAt: "desc" },
  })
}

async function findById(id: string) {
  return prisma.user.findUnique({
    where: { id },
    include: userInclude,
  })
}

async function findByPhone(phone: string) {
  return prisma.user.findUnique({
    where: { phone },
    include: userInclude,
  })
}

async function findMemberWithUser(memberId: string) {
  return prisma.member.findUnique({
    where: { id: memberId },
    include: { user: true },
  })
}

async function findPermissionsByKeys(keys: string[]) {
  return prisma.permission.findMany({ where: { key: { in: keys } } })
}

async function create(data: {
  name: string
  phone: string
  passwordHash: string
  memberId: string | null
}) {
  return prisma.user.create({
    data,
    include: userInclude,
  })
}

async function update(
  id: string,
  data: {
    name?: string
    phone?: string
    passwordHash?: string
    isActive?: boolean
    memberId?: string | null
  }
) {
  return prisma.user.update({
    where: { id },
    data,
    include: userInclude,
  })
}

async function setPermissions(userId: string, permissionIds: string[]) {
  await prisma.$transaction([
    prisma.userPermission.deleteMany({ where: { userId } }),
    prisma.userPermission.createMany({
      data: permissionIds.map((permissionId) => ({ userId, permissionId })),
    }),
  ])
}

export type UserRecord = NonNullable<Awaited<ReturnType<typeof findById>>>

export const usersRepository = {
  list,
  findById,
  findByPhone,
  findMemberWithUser,
  findPermissionsByKeys,
  create,
  update,
  setPermissions,
}
