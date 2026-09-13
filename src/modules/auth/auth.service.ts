import { compare } from "bcryptjs"
import jwt from "jsonwebtoken"
import { ApiError } from "../../shared/errors/api-error.js"
import type { AuthUser } from "../../shared/types/auth-user.js"
import type { LoginInput, LoginResponse } from "./auth.dto.js"
import { authRepository, type UserWithPermissions } from "./auth.repository.js"

function requireJwtSecret(): string {
  const secret = process.env.JWT_SECRET
  if (!secret) {
    throw new ApiError(500, "JWT_SECRET is not configured")
  }
  return secret
}

function toAuthUser(user: UserWithPermissions): AuthUser {
  return {
    id: user.id,
    name: user.name,
    phone: user.phone,
    isAdmin: user.isAdmin,
    role: user.member?.role ?? "External",
    permissions: user.permissions.map((p) => p.permission.key),
  }
}

export async function login(input: LoginInput): Promise<LoginResponse> {
  const user = await authRepository.findByPhone(input.phone)

  if (!user) {
    throw new ApiError(401, "Invalid phone or password")
  }

  if (!user.isActive || (user.member !== null && !user.member.isActive)) {
    throw new ApiError(401, "Account is inactive")
  }

  const passwordMatches = await compare(input.password, user.passwordHash)
  if (!passwordMatches) {
    throw new ApiError(401, "Invalid phone or password")
  }

  const token = jwt.sign({ sub: user.id }, requireJwtSecret(), { expiresIn: "7d" })

  return {
    token,
    user: toAuthUser(user),
  }
}

export async function getCurrentUser(userId: string): Promise<AuthUser> {
  const user = await authRepository.findById(userId)
  if (!user) {
    throw new ApiError(401, "User not found")
  }
  return toAuthUser(user)
}
