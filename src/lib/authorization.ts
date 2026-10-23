import type { UserRole } from '../types/database'

export function hasRequiredRole(
  actual: UserRole | undefined,
  required: Exclude<UserRole, 'admin'>,
) {
  return actual === required
}

export function getProtectedRouteDecision(
  state: {
    loading: boolean
    configured: boolean
    userId: string | null
    profileRole: UserRole | null
    hasError: boolean
  },
  required: Exclude<UserRole, 'admin'>,
) {
  if (state.loading) return 'loading'
  if (!state.configured) return 'configuration-required'
  if (!state.userId) return 'login-required'
  if (state.hasError) return 'profile-error'
  if (!state.profileRole) return 'profile-unavailable'
  return hasRequiredRole(state.profileRole, required) ? 'allow' : 'wrong-role'
}
