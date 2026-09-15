import { Router } from "express"
import { authMiddleware } from "../../shared/middlewares/auth.middleware.js"
import { requirePermission } from "../../shared/middlewares/require-permission.middleware.js"
import * as statsController from "./stats.controller.js"

export const statsRouter = Router()

statsRouter.use(authMiddleware)

/**
 * @openapi
 * /stats:
 *   get:
 *     summary: Dashboard statistics
 *     tags: [Stats]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Stats fetched
 */
statsRouter.get("/", requirePermission("reports:view"), statsController.getStats)
