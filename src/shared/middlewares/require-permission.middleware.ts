import type { NextFunction, Request, Response } from "express"
import { ApiError } from "../errors/api-error.js"

export function requirePermission(key: string) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const user = req.user
    if (!user) {
      next(new ApiError(401, "Unauthorized"))
      return
    }

    if (user.isAdmin || user.permissions.includes(key)) {
      next()
      return
    }

    next(new ApiError(403, "Forbidden"))
  }
}
