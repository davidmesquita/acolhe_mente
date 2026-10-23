import type { User } from '@supabase/supabase-js'
import { requireSupabase } from '../../lib/supabaseClient'
import type { Profile, ProfessionalProfile, VerificationStatus } from '../../types/database'

export const recoveryRedirectUrl =
  typeof window === 'undefined'
    ? '/recuperar-senha'
    : new URL('/recuperar-senha', window.location.origin).toString()

export async function signUp(email: string, password: string, displayName: string) {
  const { data, error } = await requireSupabase().auth.signUp({
    email: email.trim(),
    password,
    options: { data: { display_name: displayName.trim().slice(0, 100) } },
  })
  if (error) throw error
  return data
}

export async function signIn(email: string, password: string) {
  const { data, error } = await requireSupabase().auth.signInWithPassword({
    email: email.trim(),
    password,
  })
  if (error) throw error
  return data
}

export async function signOut() {
  const { error } = await requireSupabase().auth.signOut()
  if (error) throw error
}

export async function requestPasswordReset(email: string) {
  const { error } = await requireSupabase().auth.resetPasswordForEmail(email.trim(), {
    redirectTo: recoveryRedirectUrl,
  })
  if (error) throw error
}

export async function updatePassword(password: string) {
  const { error } = await requireSupabase().auth.updateUser({ password })
  if (error) throw error
}

export async function getProfile(user: User): Promise<Profile> {
  const { data, error } = await requireSupabase()
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()
  if (error) throw error
  return data
}

export async function updateDisplayName(displayName: string) {
  const client = requireSupabase()
  const {
    data: { user },
    error: userError,
  } = await client.auth.getUser()
  if (userError || !user) throw userError ?? new Error('Sessão expirada. Entre novamente.')
  const { data, error } = await client
    .from('profiles')
    .update({ display_name: displayName.trim().slice(0, 100) })
    .eq('id', user.id)
    .select('*')
    .single()
  if (error) throw error
  return data
}

export async function getProfessionalProfile(userId: string): Promise<ProfessionalProfile | null> {
  const { data, error } = await requireSupabase()
    .from('professional_profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle()
  if (error) throw error
  return data
}

export async function saveProfessionalProfile(
  profile: Pick<
    ProfessionalProfile,
    'presentation' | 'specialties' | 'registration_number' | 'accessibility_modalities'
  >,
) {
  const client = requireSupabase()
  const {
    data: { user },
    error: userError,
  } = await client.auth.getUser()
  if (userError || !user) throw userError ?? new Error('Sessão expirada. Entre novamente.')
  const { data, error } = await client
    .from('professional_profiles')
    .upsert({ id: user.id, ...profile })
    .select('*')
    .single()
  if (error) throw error
  return data
}

export async function assignPsychologist(userId: string) {
  const { error } = await requireSupabase().functions.invoke('admin-professional-management', {
    body: { action: 'assign_psychologist', userId },
  })
  if (error) throw error
}

export async function setProfessionalVerification(userId: string, status: VerificationStatus) {
  const { error } = await requireSupabase().functions.invoke('admin-professional-management', {
    body: { action: 'set_verification_status', userId, status },
  })
  if (error) throw error
}
