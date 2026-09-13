import { Prisma } from "../../generated/prisma/client.js"
import { ApiError } from "../../shared/errors/api-error.js"
import type {
  AssignmentDto,
  CreateAssignmentInput,
  UpdateAssignmentInput,
} from "./assignments.dto.js"
import { assignmentsRepository, type AssignmentRecord } from "./assignments.repository.js"

function toAssignmentDto(assignment: AssignmentRecord): AssignmentDto {
  return {
    id: assignment.id,
    contributionId: assignment.contributionId,
    memberId: assignment.memberId,
    memberName: assignment.member.name,
    requiredAmount: assignment.requiredAmount.toString(),
  }
}

export async function list(contributionId: string): Promise<AssignmentDto[]> {
  const contribution = await assignmentsRepository.getContribution(contributionId)
  if (!contribution) {
    throw new ApiError(404, "Contribution not found")
  }

  const assignments = await assignmentsRepository.listByContribution(contributionId)
  return assignments.map(toAssignmentDto)
}

export async function create(
  contributionId: string,
  input: CreateAssignmentInput
): Promise<AssignmentDto> {
  const contribution = await assignmentsRepository.getContribution(contributionId)
  if (!contribution) {
    throw new ApiError(404, "Contribution not found")
  }
  if (contribution.type !== "TARGETED") {
    throw new ApiError(400, "Assignments are only allowed on TARGETED contributions")
  }

  const memberExists = await assignmentsRepository.memberExists(input.memberId)
  if (!memberExists) {
    throw new ApiError(404, "Member not found")
  }

  const existing = await assignmentsRepository.findByContributionAndMember(
    contributionId,
    input.memberId
  )
  if (existing) {
    throw new ApiError(409, "This member already has an assignment for this contribution")
  }

  const assignment = await assignmentsRepository.create({
    contributionId,
    memberId: input.memberId,
    requiredAmount: new Prisma.Decimal(input.requiredAmount),
  })

  return toAssignmentDto(assignment)
}

export async function update(id: string, input: UpdateAssignmentInput): Promise<AssignmentDto> {
  const existing = await assignmentsRepository.findById(id)
  if (!existing) {
    throw new ApiError(404, "Assignment not found")
  }

  const assignment = await assignmentsRepository.update(id, {
    requiredAmount: new Prisma.Decimal(input.requiredAmount),
  })

  return toAssignmentDto(assignment)
}

export async function remove(id: string): Promise<AssignmentDto> {
  const existing = await assignmentsRepository.findById(id)
  if (!existing) {
    throw new ApiError(404, "Assignment not found")
  }

  const assignment = await assignmentsRepository.remove(id)
  return toAssignmentDto(assignment)
}
