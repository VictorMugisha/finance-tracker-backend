import { Router } from "express"
import { authMiddleware } from "../../shared/middlewares/auth.middleware.js"
import { requirePermission } from "../../shared/middlewares/require-permission.middleware.js"
import * as recurringController from "./recurring-contributions.controller.js"

export const recurringRouter = Router()

recurringRouter.use(authMiddleware)

/**
 * @openapi
 * /recurring-contributions:
 *   get:
 *     summary: List recurring contributions
 *     tags: [Recurring]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Recurring contributions fetched
 */
recurringRouter.get("/", requirePermission("contributions:read"), recurringController.list)

/**
 * @openapi
 * /recurring-contributions:
 *   post:
 *     summary: Create a recurring contribution
 *     description: Creates the recurring contribution and its first period.
 *     tags: [Recurring]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, period, targetAmount]
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *                 nullable: true
 *               period:
 *                 type: string
 *                 enum: [WEEKLY, MONTHLY, QUARTERLY]
 *               targetAmount:
 *                 type: string
 *     responses:
 *       201:
 *         description: Recurring contribution created
 */
recurringRouter.post("/", requirePermission("contributions:create"), recurringController.create)

/**
 * @openapi
 * /recurring-contributions/{id}/report:
 *   get:
 *     summary: Cumulative recurring report
 *     tags: [Recurring]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Recurring report generated
 */
recurringRouter.get("/:id/report", requirePermission("reports:view"), recurringController.report)

/**
 * @openapi
 * /recurring-contributions/{id}:
 *   get:
 *     summary: Get a recurring contribution
 *     tags: [Recurring]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Recurring contribution fetched
 */
recurringRouter.get("/:id", requirePermission("contributions:read"), recurringController.getById)

/**
 * @openapi
 * /recurring-contributions/{id}:
 *   patch:
 *     summary: Update a recurring contribution
 *     tags: [Recurring]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Recurring contribution updated
 */
recurringRouter.patch("/:id", requirePermission("contributions:update"), recurringController.update)

/**
 * @openapi
 * /recurring-contributions/{id}/rollover:
 *   post:
 *     summary: Roll over into the next period
 *     tags: [Recurring]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       201:
 *         description: New period created
 */
recurringRouter.post(
  "/:id/rollover",
  requirePermission("contributions:create"),
  recurringController.rollover
)

/**
 * @openapi
 * /recurring-contributions/{id}/close:
 *   post:
 *     summary: Close a recurring contribution
 *     tags: [Recurring]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Recurring contribution closed
 */
recurringRouter.post(
  "/:id/close",
  requirePermission("contributions:update"),
  recurringController.close
)

/**
 * @openapi
 * /recurring-contributions/{id}/reopen:
 *   post:
 *     summary: Reopen a recurring contribution
 *     tags: [Recurring]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Recurring contribution reopened
 */
recurringRouter.post(
  "/:id/reopen",
  requirePermission("contributions:update"),
  recurringController.reopen
)
