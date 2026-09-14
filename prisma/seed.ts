import "dotenv/config"
import { hash } from "bcryptjs"
import { prisma } from "../src/shared/db/prisma.js"

const PERMISSIONS: { key: string; description: string }[] = [
  { key: "members:read", description: "View members" },
  { key: "members:write", description: "Create and update members" },
  { key: "users:read", description: "View users" },
  { key: "users:write", description: "Create and update users" },
  { key: "contributions:create", description: "Create contributions" },
  { key: "contributions:read", description: "View contributions" },
  { key: "contributions:update", description: "Update contributions" },
  { key: "assignments:write", description: "Create and update contribution assignments" },
  { key: "payments:record", description: "Record payments" },
  { key: "payments:read", description: "View payments" },
  { key: "payments:update", description: "Correct payments" },
  { key: "expenses:record", description: "Record expenses" },
  { key: "expenses:read", description: "View expenses" },
  { key: "expenses:update", description: "Correct expenses" },
  { key: "reports:view", description: "View reports" },
]

const ADMIN = {
  name: "Victor Mugisha",
  phone: "0799303355",
  password: "0799303355",
}

async function main(): Promise<void> {
  for (const permission of PERMISSIONS) {
    await prisma.permission.upsert({
      where: { key: permission.key },
      update: { description: permission.description },
      create: permission,
    })
  }

  const passwordHash = await hash(ADMIN.password, 10)

  await prisma.user.upsert({
    where: { phone: ADMIN.phone },
    update: {
      name: ADMIN.name,
      passwordHash,
      isAdmin: true,
      isActive: true,
    },
    create: {
      name: ADMIN.name,
      phone: ADMIN.phone,
      passwordHash,
      isAdmin: true,
      isActive: true,
    },
  })

  console.log(`Seeded ${PERMISSIONS.length} permissions and admin user (${ADMIN.phone})`)
}

main()
  .catch((err) => {
    console.error(err)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
