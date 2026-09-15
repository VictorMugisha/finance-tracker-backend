import { Router } from "express"
import { authMiddleware } from "../../shared/middlewares/auth.middleware.js"
import { requireAdmin } from "../../shared/middlewares/require-admin.middleware.js"
import { requirePermission } from "../../shared/middlewares/require-permission.middleware.js"
import * as usersController from "./users.controller.js"

export const usersRouter = Router()

usersRouter.use(authMiddleware)

/**
 * @openapi
 * /users:
 *   get:
 *     summary: List users
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Users fetched
 */
usersRouter.get("/", requirePermission("users:read"), usersController.list)

/**
 * @openapi
 * /users/{id}:
 *   get:
 *     summary: Get a user
 *     tags: [Users]
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
 *         description: User fetched
 *       404:
 *         description: User not found
 */
usersRouter.get("/:id", requirePermission("users:read"), usersController.getById)

/**
 * @openapi
 * /users:
 *   post:
 *     summary: Create a user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, phone, password]
 *             properties:
 *               memberId:
 *                 type: string
 *                 nullable: true
 *               name:
 *                 type: string
 *               phone:
 *                 type: string
 *               password:
 *                 type: string
 *               permissions:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: User created
 */
usersRouter.post("/", requirePermission("users:write"), usersController.create)

/**
 * @openapi
 * /users/{id}:
 *   patch:
 *     summary: Update a user
 *     tags: [Users]
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
 *         description: User updated
 */
usersRouter.patch("/:id", requirePermission("users:write"), usersController.update)

/**
 * @openapi
 * /users/{id}/permissions:
 *   put:
 *     summary: Replace a user's permissions (admin only)
 *     tags: [Users]
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
 *         description: Permissions updated
 */
usersRouter.put("/:id/permissions", requireAdmin, usersController.setPermissions)
