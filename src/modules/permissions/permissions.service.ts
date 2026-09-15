import type { PermissionDto } from "./permissions.dto.js"
import { permissionsRepository } from "./permissions.repository.js"

export async function list(): Promise<PermissionDto[]> {
  const permissions = await permissionsRepository.list()
  return permissions.map((permission) => ({
    id: permission.id,
    key: permission.key,
    description: permission.description,
  }))
}
