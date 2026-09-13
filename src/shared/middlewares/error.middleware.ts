import type { NextFunction, Request, Response } from "express"
import { ZodError } from "zod"
import { ApiError } from "../errors/api-error.js"
import { sendFail } from "../http/response.js"

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
    sendFail(res, err.status, err.message)
    return
  }

  if (err instanceof ZodError) {
    const message = err.issues.map((issue) => issue.message).join(", ")
    sendFail(res, 400, message || "Validation failed")
    return
  }

  if (isHttpError(err)) {
    sendFail(res, err.status, err.message ?? "Request error")
    return
  }

  console.error(err)
  sendFail(res, 500, "Internal server error")
}
