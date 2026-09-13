import { ApiError } from "../../shared/errors/api-error.js"
import type {
  CreateMemberInput,
  LinkedUserDto,
  MemberDto,
  UpdateMemberInput,
} from "./members.dto.js"
import { membersRepository, type MemberRecord } from "./members.repository.js"

function toLinkedUserDto(user: MemberRecord["user"]): LinkedUserDto | null {
  if (!user) {
    return null
  }

  return {
    id: user.id,
    name: user.name,
    phone: user.phone,
    isAdmin: user.isAdmin,
    isActive: user.isActive,
    memberId: user.memberId,
    createdAt: user.createdAt.toISOString(),
  }
}

function toMemberDto(member: MemberRecord): MemberDto {
  return {
    id: member.id,
    name: member.name,
    phone: member.phone,
    role: member.role,
    isActive: member.isActive,
    createdAt: member.createdAt.toISOString(),
    user: toLinkedUserDto(member.user),
  }
}

export async function list(search?: string): Promise<MemberDto[]> {
  const members = await membersRepository.list(search)
  return members.map(toMemberDto)
}

export async function getById(id: string): Promise<MemberDto> {
  const member = await membersRepository.findById(id)
  if (!member) {
    throw new ApiError(404, "Member not found")
  }
  return toMemberDto(member)
}

export async function create(input: CreateMemberInput): Promise<MemberDto> {
  const member = await membersRepository.create({
    name: input.name,
    phone: input.phone ?? null,
    role: input.role ?? null,
  })
  return toMemberDto(member)
}

export async function update(id: string, input: UpdateMemberInput): Promise<MemberDto> {
  const existing = await membersRepository.findById(id)
  if (!existing) {
    throw new ApiError(404, "Member not found")
  }

  const hasChanges = [input.name, input.phone, input.role, input.isActive].some(
    (value) => value !== undefined
  )
  if (!hasChanges) {
    throw new ApiError(400, "No fields to update")
  }

  const member = await membersRepository.update(id, {
    name: input.name,
    phone: input.phone,
    role: input.role,
    isActive: input.isActive,
  })

  return toMemberDto(member)
}

export async function deactivate(id: string): Promise<MemberDto> {
  const existing = await membersRepository.findById(id)
  if (!existing) {
    throw new ApiError(404, "Member not found")
  }

  const member = await membersRepository.deactivate(id)
  return toMemberDto(member)
}
