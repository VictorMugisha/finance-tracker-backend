import { prisma } from "../../shared/db/prisma.js"

async function list() {
  return prisma.permission.findMany({ orderBy: { key: "asc" } })
}

export const permissionsRepository = { list }
