import type { NextFunction, Request, Response } from "express"
import jwt from "jsonwebtoken"
import { prisma } from "../db/prisma.js"
import { ApiError } from "../errors/api-error.js"
import type { AuthUser } from "../types/auth-user.js"

export async function authMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  const header = req.headers.authorization
  if (!header?.startsWith("Bearer ")) {
    next(new ApiError(401, "Missing or invalid authorization header"))
    return
  }

  const secret = process.env.JWT_SECRET
  if (!secret) {
    next(new ApiError(500, "JWT_SECRET is not configured"))
    return
  }

  const token = header.slice("Bearer ".length)

  let userId: string
  try {
    const payload = jwt.verify(token, secret) as jwt.JwtPayload
    if (typeof payload.sub !== "string") {
      next(new ApiError(401, "Invalid token"))
      return
    }
    userId = payload.sub
  } catch {
    next(new ApiError(401, "Invalid or expired token"))
    return
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      member: true,
      permissions: { include: { permission: true } },
    },
  })

  if (!user || !user.isActive || (user.member !== null && !user.member.isActive)) {
    next(new ApiError(401, "Account not found or inactive"))
    return
  }

  const authUser: AuthUser = {
    id: user.id,
    name: user.name,
    phone: user.phone,
    isAdmin: user.isAdmin,
    role: user.member?.role ?? "External",
    permissions: user.permissions.map((p) => p.permission.key),
  }

  req.user = authUser
  next()
}
