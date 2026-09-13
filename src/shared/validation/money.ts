import { z } from "zod"

export const moneySchema = z
  .string({ error: "Amount is required" })
  .regex(/^\d+(\.\d+)?$/, "Amount must be a valid number")
  .refine((value) => Number(value) > 0, "Amount must be greater than zero")
