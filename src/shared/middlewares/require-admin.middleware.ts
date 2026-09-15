import type { NextFunction, Request, Response } from "express"
import { ApiError } from "../errors/api-error.js"

export function requireAdmin(req: Request, _res: Response, next: NextFunction): void {
  if (!req.user) {
    next(new ApiError(401, "Unauthorized"))
    return
  }

  if (req.user.isAdmin) {
    next()
    return
  }

  next(new ApiError(403, "Forbidden"))
}
