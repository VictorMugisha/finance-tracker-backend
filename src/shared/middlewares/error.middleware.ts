import type { NextFunction, Request, Response } from "express"
import { ZodError } from "zod"
import { ApiError } from "../errors/api-error.js"

function isHttpError(err: unknown): err is { status: number; message?: string } {
  return (
    typeof err === "object" &&
    err !== null &&
    "status" in err &&
    typeof (err as { status: unknown }).status === "number"
  )
}

export function errorMiddleware(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof ApiError) {
    res.status(err.status).json({ message: err.message })
    return
  }

  if (err instanceof ZodError) {
    res.status(400).json({ message: "Validation failed", issues: err.issues })
    return
  }

  if (isHttpError(err)) {
    res.status(err.status).json({ message: err.message ?? "Request error" })
    return
  }

  console.error(err)
  res.status(500).json({ message: "Internal server error" })
}
