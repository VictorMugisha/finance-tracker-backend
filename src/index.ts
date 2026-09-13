import "dotenv/config"
import cors from "cors"
import express from "express"
import swaggerUi from "swagger-ui-express"
import { authRouter } from "./modules/auth/auth.route.js"
import { membersRouter } from "./modules/members/members.route.js"
import { prisma } from "./shared/db/prisma.js"
import { swaggerSpec } from "./shared/docs/swagger.js"
import { sendFail, sendSuccess } from "./shared/http/response.js"
import { errorMiddleware } from "./shared/middlewares/error.middleware.js"

const app = express()
const PORT = Number(process.env.PORT ?? 4000)

app.use(cors())
app.use(express.json())

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec))
app.get("/api-docs.json", (_req, res) => {
  res.json(swaggerSpec)
})

/**
 * @openapi
 * /health:
 *   get:
 *     summary: Health check
 *     description: Verify the API is running and the database is reachable.
 *     tags:
 *       - Health
 *     responses:
 *       200:
 *         description: API and database are healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode:
 *                   type: number
 *                 status:
 *                   type: string
 *                 meta:
 *                   type: object
 *                 data:
 *                   type: object
 *                   properties:
 *                     database:
 *                       type: string
 *                       example: connected
 *                 message:
 *                   type: string
 *       503:
 *         description: Database unreachable
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode:
 *                   type: number
 *                 status:
 *                   type: string
 *                 meta:
 *                   type: object
 *                   nullable: true
 *                 data:
 *                   type: object
 *                   nullable: true
 *                 message:
 *                   type: string
 */
app.get("/health", async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`
    sendSuccess(res, 200, "Service is healthy", { database: "connected" })
  } catch {
    sendFail(res, 503, "Database is unreachable")
  }
})

app.use("/auth", authRouter)
app.use("/members", membersRouter)

app.use(errorMiddleware)

async function checkDatabase(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`
    return true
  } catch {
    return false
  }
}

async function start(): Promise<void> {
  const dbConnected = await checkDatabase()

  if (dbConnected) {
    console.log("Database: connected")
  } else {
    console.error("Database: NOT connected")
  }

  app.listen(PORT, () => {
    console.log(`API listening on http://localhost:${PORT}`)
    console.log(`Swagger docs: http://localhost:${PORT}/api-docs`)
  })
}

void start()
