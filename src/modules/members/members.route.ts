import { Router } from "express"
import { authMiddleware } from "../../shared/middlewares/auth.middleware.js"
import { requirePermission } from "../../shared/middlewares/require-permission.middleware.js"
import * as membersController from "./members.controller.js"

export const membersRouter = Router()

membersRouter.use(authMiddleware)

/**
 * @openapi
 * /members:
 *   get:
 *     summary: List members
 *     description: Return all members, optionally filtered by name.
 *     tags: [Members]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Case-insensitive name search
 *     responses:
 *       200:
 *         description: Members fetched successfully
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
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Member'
 *                 message:
 *                   type: string
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
membersRouter.get("/", requirePermission("members:read"), membersController.list)

/**
 * @openapi
 * /members/{id}:
 *   get:
 *     summary: Get a member
 *     tags: [Members]
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
 *         description: Member fetched successfully
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
 *                   $ref: '#/components/schemas/Member'
 *                 message:
 *                   type: string
 *       404:
 *         description: Member not found
 */
membersRouter.get("/:id", requirePermission("members:read"), membersController.getById)

/**
 * @openapi
 * /members:
 *   post:
 *     summary: Create a member
 *     tags: [Members]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name:
 *                 type: string
 *               phone:
 *                 type: string
 *                 nullable: true
 *               role:
 *                 type: string
 *                 enum: [LEADER, ASSISTANT, ACCOUNTANT, MEMBER]
 *                 nullable: true
 *     responses:
 *       201:
 *         description: Member created successfully
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
 *                   $ref: '#/components/schemas/Member'
 *                 message:
 *                   type: string
 */
membersRouter.post("/", requirePermission("members:write"), membersController.create)

/**
 * @openapi
 * /members/{id}:
 *   patch:
 *     summary: Update a member
 *     tags: [Members]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               phone:
 *                 type: string
 *                 nullable: true
 *               role:
 *                 type: string
 *                 enum: [LEADER, ASSISTANT, ACCOUNTANT, MEMBER]
 *                 nullable: true
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Member updated successfully
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
 *                   $ref: '#/components/schemas/Member'
 *                 message:
 *                   type: string
 *       404:
 *         description: Member not found
 */
membersRouter.patch("/:id", requirePermission("members:write"), membersController.update)

/**
 * @openapi
 * /members/{id}:
 *   delete:
 *     summary: Deactivate a member
 *     description: Soft delete — sets isActive to false.
 *     tags: [Members]
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
 *         description: Member deactivated successfully
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
 *                   $ref: '#/components/schemas/Member'
 *                 message:
 *                   type: string
 *       404:
 *         description: Member not found
 */
membersRouter.delete("/:id", requirePermission("members:write"), membersController.remove)
