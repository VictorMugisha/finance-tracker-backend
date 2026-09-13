import { Router } from "express"
import { authMiddleware } from "../../shared/middlewares/auth.middleware.js"
import { requirePermission } from "../../shared/middlewares/require-permission.middleware.js"
import * as paymentsController from "./payments.controller.js"

export const paymentsRouter = Router()

paymentsRouter.use(authMiddleware)

/**
 * @openapi
 * /payments:
 *   get:
 *     summary: List payments
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: contributionId
 *         schema:
 *           type: string
 *       - in: query
 *         name: memberId
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Payments fetched
 */
paymentsRouter.get("/", requirePermission("payments:read"), paymentsController.list)

/**
 * @openapi
 * /payments:
 *   post:
 *     summary: Record a payment
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [contributionId, memberId, amount]
 *             properties:
 *               contributionId:
 *                 type: string
 *               memberId:
 *                 type: string
 *               amount:
 *                 type: string
 *               note:
 *                 type: string
 *                 nullable: true
 *               paidAt:
 *                 type: string
 *                 format: date-time
 *                 nullable: true
 *     responses:
 *       201:
 *         description: Payment recorded
 */
paymentsRouter.post("/", requirePermission("payments:record"), paymentsController.create)

/**
 * @openapi
 * /payments/{id}:
 *   patch:
 *     summary: Correct a payment
 *     tags: [Payments]
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
 *         description: Payment updated
 */
paymentsRouter.patch("/:id", requirePermission("payments:update"), paymentsController.update)
