import { Router } from "express"
import { authMiddleware } from "../../shared/middlewares/auth.middleware.js"
import { requirePermission } from "../../shared/middlewares/require-permission.middleware.js"
import * as assignmentsController from "./assignments.controller.js"

export const assignmentsRouter = Router({ mergeParams: true })

assignmentsRouter.use(authMiddleware)

/**
 * @openapi
 * /contributions/{contributionId}/assignments:
 *   get:
 *     summary: List assignments for a contribution
 *     tags: [Assignments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: contributionId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Assignments fetched
 */
assignmentsRouter.get("/", requirePermission("contributions:read"), assignmentsController.list)

/**
 * @openapi
 * /contributions/{contributionId}/assignments:
 *   post:
 *     summary: Create an assignment
 *     tags: [Assignments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: contributionId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [memberId, requiredAmount]
 *             properties:
 *               memberId:
 *                 type: string
 *               requiredAmount:
 *                 type: string
 *     responses:
 *       201:
 *         description: Assignment created
 */
assignmentsRouter.post("/", requirePermission("assignments:write"), assignmentsController.create)

/**
 * @openapi
 * /contributions/{contributionId}/assignments/{assignmentId}:
 *   patch:
 *     summary: Update an assignment
 *     tags: [Assignments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: contributionId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: assignmentId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Assignment updated
 */
assignmentsRouter.patch(
  "/:assignmentId",
  requirePermission("assignments:write"),
  assignmentsController.update
)

/**
 * @openapi
 * /contributions/{contributionId}/assignments/{assignmentId}:
 *   delete:
 *     summary: Remove an assignment
 *     tags: [Assignments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: contributionId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: assignmentId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Assignment removed
 */
assignmentsRouter.delete(
  "/:assignmentId",
  requirePermission("assignments:write"),
  assignmentsController.remove
)
