import { Router } from "express"
import { authMiddleware } from "../../shared/middlewares/auth.middleware.js"
import { requirePermission } from "../../shared/middlewares/require-permission.middleware.js"
import * as permissionsController from "./permissions.controller.js"

export const permissionsRouter = Router()

permissionsRouter.use(authMiddleware)

/**
 * @openapi
 * /permissions:
 *   get:
 *     summary: List all permissions
 *     tags: [Permissions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Permissions fetched
 */
permissionsRouter.get("/", requirePermission("users:read"), permissionsController.list)
