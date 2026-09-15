import { hash } from "bcryptjs"
import { ApiError } from "../../shared/errors/api-error.js"
import type { CreateUserInput, SetPermissionsInput, UpdateUserInput, UserDto } from "./users.dto.js"
import { usersRepository, type UserRecord } from "./users.repository.js"

function toUserDto(user: UserRecord): UserDto {
  return {
    id: user.id,
    name: user.name,
    phone: user.phone,
    isAdmin: user.isAdmin,
    isActive: user.isActive,
    memberId: user.memberId,
    memberName: user.member?.name ?? null,
    role: user.member?.role ?? null,
    permissions: user.permissions.map((p) => p.permission.key),
    createdAt: user.createdAt.toISOString(),
  }
}

async function resolvePermissionIds(keys: string[]): Promise<string[]> {
  const uniqueKeys = [...new Set(keys)]
  const permissions = await usersRepository.findPermissionsByKeys(uniqueKeys)
  if (permissions.length !== uniqueKeys.length) {
    throw new ApiError(400, "One or more permissions are invalid")
  }
  return permissions.map((permission) => permission.id)
}

export async function list(): Promise<UserDto[]> {
  const users = await usersRepository.list()
  return users.map(toUserDto)
}

export async function getById(id: string): Promise<UserDto> {
  const user = await usersRepository.findById(id)
  if (!user) {
    throw new ApiError(404, "User not found")
  }
  return toUserDto(user)
}

export async function create(input: CreateUserInput): Promise<UserDto> {
  const phoneTaken = await usersRepository.findByPhone(input.phone)
  if (phoneTaken) {
    throw new ApiError(409, "A user with this phone already exists")
  }

  if (input.memberId) {
    const member = await usersRepository.findMemberWithUser(input.memberId)
    if (!member) {
      throw new ApiError(404, "Member not found")
    }
    if (member.user) {
      throw new ApiError(409, "Member already has a user account")
    }
  }

  const permissionIds =
    input.permissions && input.permissions.length > 0
      ? await resolvePermissionIds(input.permissions)
      : []

  const passwordHash = await hash(input.password, 10)

  const user = await usersRepository.create({
    name: input.name,
    phone: input.phone,
    passwordHash,
    memberId: input.memberId ?? null,
  })

  if (permissionIds.length > 0) {
    await usersRepository.setPermissions(user.id, permissionIds)
  }

  return getById(user.id)
}

export async function update(id: string, input: UpdateUserInput): Promise<UserDto> {
  const existing = await usersRepository.findById(id)
  if (!existing) {
    throw new ApiError(404, "User not found")
  }

  const hasChanges = [input.name, input.phone, input.password, input.isActive, input.memberId].some(
    (value) => value !== undefined
  )
  if (!hasChanges) {
    throw new ApiError(400, "No fields to update")
  }

  if (input.phone && input.phone !== existing.phone) {
    const phoneTaken = await usersRepository.findByPhone(input.phone)
    if (phoneTaken) {
      throw new ApiError(409, "A user with this phone already exists")
    }
  }

  if (input.memberId) {
    const member = await usersRepository.findMemberWithUser(input.memberId)
    if (!member) {
      throw new ApiError(404, "Member not found")
    }
    if (member.user && member.user.id !== id) {
      throw new ApiError(409, "Member already has a user account")
    }
  }

  await usersRepository.update(id, {
    name: input.name,
    phone: input.phone,
    passwordHash: input.password ? await hash(input.password, 10) : undefined,
    isActive: input.isActive,
    memberId: input.memberId,
  })

  return getById(id)
}

export async function setPermissions(id: string, input: SetPermissionsInput): Promise<UserDto> {
  const existing = await usersRepository.findById(id)
  if (!existing) {
    throw new ApiError(404, "User not found")
  }

  const permissionIds = await resolvePermissionIds(input.permissions)
  await usersRepository.setPermissions(id, permissionIds)
  return getById(id)
}
