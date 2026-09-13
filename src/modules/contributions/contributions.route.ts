import { Router } from "express"
import { authMiddleware } from "../../shared/middlewares/auth.middleware.js"
import { requirePermission } from "../../shared/middlewares/require-permission.middleware.js"
import * as contributionsController from "./contributions.controller.js"

export const contributionsRouter = Router()

contributionsRouter.use(authMiddleware)

/**
 * @openapi
 * /contributions/balance:
 *   get:
 *     summary: Group cash balance
 *     description: Total collected (all payments) minus total disbursed (all expenses).
 *     tags: [Contributions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Group balance
 */
contributionsRouter.get(
  "/balance",
  requirePermission("reports:view"),
  contributionsController.balance
)

/**
 * @openapi
 * /contributions:
 *   get:
 *     summary: List contributions
 *     tags: [Contributions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [TARGETED, OPEN]
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [OPEN, CLOSED]
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Contributions fetched
 */
contributionsRouter.get("/", requirePermission("contributions:read"), contributionsController.list)

/**
 * @openapi
 * /contributions:
 *   post:
 *     summary: Create a contribution
 *     tags: [Contributions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, type]
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *                 nullable: true
 *               type:
 *                 type: string
 *                 enum: [TARGETED, OPEN]
 *               targetAmount:
 *                 type: string
 *                 nullable: true
 *               deadline:
 *                 type: string
 *                 format: date-time
 *                 nullable: true
 *     responses:
 *       201:
 *         description: Contribution created
 */
contributionsRouter.post(
  "/",
  requirePermission("contributions:create"),
  contributionsController.create
)

/**
 * @openapi
 * /contributions/{id}/report:
 *   get:
 *     summary: Per-member contribution report
 *     tags: [Contributions]
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
 *         description: Contribution report
 */
contributionsRouter.get(
  "/:id/report",
  requirePermission("reports:view"),
  contributionsController.report
)

/**
 * @openapi
 * /contributions/{id}:
 *   get:
 *     summary: Get a contribution
 *     tags: [Contributions]
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
 *         description: Contribution fetched
 */
contributionsRouter.get(
  "/:id",
  requirePermission("contributions:read"),
  contributionsController.getById
)

/**
 * @openapi
 * /contributions/{id}:
 *   patch:
 *     summary: Update a contribution
 *     tags: [Contributions]
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
 *         description: Contribution updated
 */
contributionsRouter.patch(
  "/:id",
  requirePermission("contributions:update"),
  contributionsController.update
)

/**
 * @openapi
 * /contributions/{id}/close:
 *   post:
 *     summary: Close a contribution
 *     tags: [Contributions]
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
 *         description: Contribution closed
 */
contributionsRouter.post(
  "/:id/close",
  requirePermission("contributions:update"),
  contributionsController.close
)
