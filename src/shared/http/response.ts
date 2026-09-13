import type { Response } from "express"

export interface Meta {
  total: number
  page: number
  pageSize: number
}

export interface ApiResponse<T> {
  statusCode: number
  status: "success" | "fail"
  meta: Meta | null
  data: T | null
  message: string
}

export function sendSuccess<T>(
  res: Response,
  statusCode: number,
  message: string,
  data: T,
  meta?: Meta
): void {
  const total = Array.isArray(data) ? data.length : 1

  res.status(statusCode).json({
    statusCode,
    status: "success",
    meta: meta ?? { total, page: 1, pageSize: total },
    data,
    message,
  })
}

export function sendFail(res: Response, statusCode: number, message: string): void {
  res.status(statusCode).json({
    statusCode,
    status: "fail",
    meta: null,
    data: null,
    message,
  })
}
