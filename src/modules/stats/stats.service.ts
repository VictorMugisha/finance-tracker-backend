import { prisma } from "../../shared/db/prisma.js"
import type { DashboardStats } from "./stats.dto.js"

export async function getStats(): Promise<DashboardStats> {
  const [members, users, contributions, payments, expenses] = await Promise.all([
    prisma.member.count({ where: { isActive: true } }),
    prisma.user.count({ where: { isActive: true } }),
    prisma.contribution.count(),
    prisma.payment.count(),
    prisma.expense.count(),
  ])

  return { members, users, contributions, payments, expenses }
}
