import { Router } from "express"
import { authMiddleware } from "../../shared/middlewares/auth.middleware.js"
import * as authController from "./auth.controller.js"

export const authRouter = Router()

/**
 * @openapi
 * /auth/login:
 *   post:
 *     summary: Log in
 *     description: Authenticate with phone and password to receive a JWT.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [phone, password]
 *             properties:
 *               phone:
 *                 type: string
 *                 example: "0799303355"
 *               password:
 *                 type: string
 *                 example: "0799303355"
 *     responses:
 *       200:
 *         description: Successfully authenticated
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
 *                   type: object
 *                   properties:
 *                     token:
 *                       type: string
 *                     user:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         name:
 *                           type: string
 *                         phone:
 *                           type: string
 *                         isAdmin:
 *                           type: boolean
 *                         role:
 *                           type: string
 *                         permissions:
 *                           type: array
 *                           items:
 *                             type: string
 *                 message:
 *                   type: string
 *       401:
 *         description: Invalid credentials or inactive account
 */
authRouter.post("/login", authController.login)

/**
 * @openapi
 * /auth/check-phone:
 *   post:
 *     summary: Check if a phone number is registered
 *     description: Used by the two-step login flow to verify a phone before asking for a password.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [phone]
 *             properties:
 *               phone:
 *                 type: string
 *                 example: "0799303355"
 *     responses:
 *       200:
 *         description: Phone check result
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
 *                   type: object
 *                   properties:
 *                     exists:
 *                       type: boolean
 *                     isActive:
 *                       type: boolean
 *                     name:
 *                       type: string
 *                       nullable: true
 *                 message:
 *                   type: string
 */
authRouter.post("/check-phone", authController.checkPhone)

/**
 * @openapi
 * /auth/me:
 *   get:
 *     summary: Get current user
 *     description: Return the authenticated user with permissions and role.
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current user
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
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: object
 *                 message:
 *                   type: string
 *       401:
 *         description: Unauthorized
 */
authRouter.get("/me", authMiddleware, authController.me)
