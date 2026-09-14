import { Router } from "express"
import { authMiddleware } from "../../shared/middlewares/auth.middleware.js"
import { requirePermission } from "../../shared/middlewares/require-permission.middleware.js"
import * as expensesController from "./expenses.controller.js"

export const expensesRouter = Router()

expensesRouter.use(authMiddleware)

/**
 * @openapi
 * /expenses:
 *   get:
 *     summary: List expenses
 *     tags: [Expenses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: contributionId
 *         schema:
 *           type: string
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [HANDOVER, MEMBER_SUPPORT, LEISURE, OTHER]
 *       - in: query
 *         name: recipientMemberId
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Expenses fetched
 */
expensesRouter.get("/", requirePermission("expenses:read"), expensesController.list)

/**
 * @openapi
 * /expenses/{id}:
 *   get:
 *     summary: Get an expense
 *     tags: [Expenses]
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
 *         description: Expense fetched
 *       404:
 *         description: Expense not found
 */
expensesRouter.get("/:id", requirePermission("expenses:read"), expensesController.getById)

/**
 * @openapi
 * /expenses:
 *   post:
 *     summary: Record an expense
 *     tags: [Expenses]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [type, amount]
 *             properties:
 *               contributionId:
 *                 type: string
 *                 nullable: true
 *               type:
 *                 type: string
 *                 enum: [HANDOVER, MEMBER_SUPPORT, LEISURE, OTHER]
 *               amount:
 *                 type: string
 *               recipientMemberId:
 *                 type: string
 *                 nullable: true
 *               description:
 *                 type: string
 *                 nullable: true
 *               spentAt:
 *                 type: string
 *                 format: date-time
 *                 nullable: true
 *     responses:
 *       201:
 *         description: Expense recorded
 */
expensesRouter.post("/", requirePermission("expenses:record"), expensesController.create)

/**
 * @openapi
 * /expenses/{id}:
 *   patch:
 *     summary: Correct an expense
 *     tags: [Expenses]
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
 *         description: Expense updated
 */
expensesRouter.patch("/:id", requirePermission("expenses:update"), expensesController.update)
