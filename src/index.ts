import "dotenv/config"
import cors from "cors"
import express from "express"
import swaggerUi from "swagger-ui-express"
import { authRouter } from "./modules/auth/auth.route.js"
import { prisma } from "./shared/db/prisma.js"
import { swaggerSpec } from "./shared/docs/swagger.js"
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
 *                 status:
 *                   type: string
 *                   example: ok
 *                 database:
 *                   type: string
 *                   example: connected
 *       503:
 *         description: Database unreachable
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 database:
 *                   type: string
 *                   example: unreachable
 */
app.get("/health", async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`
    res.json({ status: "ok", database: "connected" })
  } catch {
    res.status(503).json({ status: "error", database: "unreachable" })
  }
})

app.use("/auth", authRouter)

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
