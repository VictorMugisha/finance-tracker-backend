import type { Request, Response } from "express"
import { sendSuccess } from "../../shared/http/response.js"
import { createAssignmentSchema, updateAssignmentSchema } from "./assignments.dto.js"
import * as assignmentsService from "./assignments.service.js"

type ContributionParams = { contributionId: string }
type AssignmentParams = { contributionId: string; assignmentId: string }

export async function list(req: Request<ContributionParams>, res: Response): Promise<void> {
  const assignments = await assignmentsService.list(req.params.contributionId)
  sendSuccess(res, 200, "Assignments fetched successfully", assignments)
}

export async function create(req: Request<ContributionParams>, res: Response): Promise<void> {
  const input = createAssignmentSchema.parse(req.body)
  const assignment = await assignmentsService.create(req.params.contributionId, input)
  sendSuccess(res, 201, "Assignment created successfully", assignment)
}

export async function update(req: Request<AssignmentParams>, res: Response): Promise<void> {
  const input = updateAssignmentSchema.parse(req.body)
  const assignment = await assignmentsService.update(req.params.assignmentId, input)
  sendSuccess(res, 200, "Assignment updated successfully", assignment)
}

export async function remove(req: Request<AssignmentParams>, res: Response): Promise<void> {
  const assignment = await assignmentsService.remove(req.params.assignmentId)
  sendSuccess(res, 200, "Assignment removed successfully", assignment)
}
