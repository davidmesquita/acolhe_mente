import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { getProfile, signOut } from '../../features/auth/authService'
import { supabase, supabaseConfigured } from '../../lib/supabaseClient'
import type { Profile } from '../../types/database'
import { AuthContext } from './authContext'

function errorMessage(error: unknown) {
  return error instanceof Error
    ? error.message
    : 'Não foi possível carregar sua conta. Tente novamente.'
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(supabaseConfigured)
  const [error, setError] = useState<string | null>(null)
  const [sessionExpired, setSessionExpired] = useState(false)
  const intentionalSignOut = useRef(false)

  const loadProfile = useCallback(async (user: User | null) => {
    if (!user) {
      setProfile(null)
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    try {
      setProfile(await getProfile(user))
    } catch (cause) {
      setProfile(null)
      setError(errorMessage(cause))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!supabase) {
      setLoading(false)
      return
    }
    let active = true
    void supabase.auth.getSession().then(({ data, error: sessionError }) => {
      if (!active) return
      if (sessionError) {
        setError(errorMessage(sessionError))
        setLoading(false)
        return
      }
      setSession(data.session)
      void loadProfile(data.session?.user ?? null)
    })
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, nextSession) => {
      if (!active) return
      setSession(nextSession)
      if (event === 'SIGNED_OUT') {
        setProfile(null)
        if (!intentionalSignOut.current) setSessionExpired(true)
        setLoading(false)
      } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
        queueMicrotask(() => {
          if (active) void loadProfile(nextSession?.user ?? null)
        })
      }
    })
    return () => {
      active = false
      subscription.unsubscribe()
    }
  }, [loadProfile, intentionalSignOut])

  const refreshProfile = useCallback(async () => {
    await loadProfile(session?.user ?? null)
  }, [loadProfile, session])
  const logout = useCallback(async () => {
    intentionalSignOut.current = true
    try {
      await signOut()
    } finally {
      intentionalSignOut.current = false
    }
  }, [intentionalSignOut])
  const value = useMemo(
    () => ({
      session,
      user: session?.user ?? null,
      profile,
      loading,
      configured: supabaseConfigured,
      error,
      sessionExpired,
      refreshProfile,
      logout,
      clearSessionExpired: () => setSessionExpired(false),
    }),
    [session, profile, loading, error, sessionExpired, refreshProfile, logout],
  )
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
