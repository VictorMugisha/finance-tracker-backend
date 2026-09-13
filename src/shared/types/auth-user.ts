export interface AuthUser {
  id: string
  name: string
  phone: string
  isAdmin: boolean
  role: string
  permissions: string[]
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser
    }
  }
}
