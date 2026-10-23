import { describe, expect, it } from 'vitest'
import { getProtectedRouteDecision, hasRequiredRole } from '../../src/lib/authorization'

describe('autorização de rota no frontend', () => {
  it('permite somente o papel correspondente', () => {
    expect(hasRequiredRole('patient', 'patient')).toBe(true)
    expect(hasRequiredRole('psychologist', 'patient')).toBe(false)
    expect(hasRequiredRole('admin', 'psychologist')).toBe(false)
    expect(hasRequiredRole(undefined, 'patient')).toBe(false)
  })
})

describe('acesso a páginas protegidas', () => {
  const base = {
    loading: false,
    configured: true,
    userId: 'user-test',
    profileRole: 'patient' as const,
    hasError: false,
  }

  it('bloqueia antes de configurar ou autenticar', () => {
    expect(getProtectedRouteDecision({ ...base, configured: false, userId: null }, 'patient')).toBe(
      'configuration-required',
    )
    expect(getProtectedRouteDecision({ ...base, userId: null }, 'patient')).toBe('login-required')
  })

  it('aguarda perfil e não libera a página em caso de erro', () => {
    expect(getProtectedRouteDecision({ ...base, loading: true }, 'patient')).toBe('loading')
    expect(getProtectedRouteDecision({ ...base, hasError: true }, 'patient')).toBe('profile-error')
    expect(getProtectedRouteDecision({ ...base, profileRole: null }, 'patient')).toBe(
      'profile-unavailable',
    )
  })

  it('autoriza somente o papel correto', () => {
    expect(getProtectedRouteDecision(base, 'patient')).toBe('allow')
    expect(getProtectedRouteDecision({ ...base, profileRole: 'psychologist' }, 'patient')).toBe(
      'wrong-role',
    )
    expect(getProtectedRouteDecision({ ...base, profileRole: 'admin' }, 'psychologist')).toBe(
      'wrong-role',
    )
  })
})
