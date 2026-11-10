import { useCallback, useMemo, useState, type ReactNode } from 'react'
import type { User, Session } from '@supabase/supabase-js'
import { AuthContext } from './authContext'
import type { Profile } from '../../types/database'

const MOCK_USERS: Record<'patient' | 'psychologist', { user: User; profile: Profile }> = {
  patient: {
    user: { id: 'mock-patient-id', email: 'cliente1@teste.com', user_metadata: { display_name: 'Alex Cliente' }, app_metadata: {}, aud: '', created_at: '' } as unknown as User,
    profile: { id: 'mock-patient-id', display_name: 'Alex Cliente', role: 'patient', created_at: new Date().toISOString() },
  },
  psychologist: {
    user: { id: 'mock-psychologist-id', email: 'profissional@teste.com', user_metadata: { display_name: 'Dra. Marina Costa' }, app_metadata: {}, aud: '', created_at: '' } as unknown as User,
    profile: { id: 'mock-psychologist-id', display_name: 'Dra. Marina Costa', role: 'psychologist', created_at: new Date().toISOString() },
  },
}

function createMockSession(role: 'patient' | 'psychologist'): Session {
  return {
    access_token: 'mock-token',
    token_type: 'bearer',
    expires_in: 3600,
    expires_at: Math.floor(Date.now() / 1000) + 3600,
    refresh_token: 'mock-refresh',
    user: MOCK_USERS[role].user,
  }
}

export function MockAuthProvider({ children, initialRole = 'patient' }: { children: ReactNode; initialRole?: 'patient' | 'psychologist' }) {
  const [role, setRole] = useState<'patient' | 'psychologist'>(initialRole)
  const [session, setSession] = useState<Session | null>(() => createMockSession(initialRole))
  const [error, setError] = useState<string | null>(null)

  const user = session?.user ?? null
  const profile = session ? MOCK_USERS[role].profile : null

  const logout = useCallback(async () => {
    setSession(null)
  }, [])

  const loginAs = useCallback((newRole: 'patient' | 'psychologist') => {
    setRole(newRole)
    setSession(createMockSession(newRole))
    setError(null)
  }, [])

  const value = useMemo(
    () => ({
      session,
      user,
      profile,
      loading: false,
      configured: true,
      error,
      sessionExpired: false,
      refreshProfile: async () => {},
      logout,
      loginAs,
      clearSessionExpired: () => {},
    }),
    [session, user, profile, error, logout, loginAs],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}