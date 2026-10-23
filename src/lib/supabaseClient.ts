import { createClient } from '@supabase/supabase-js'
import type { Database } from '../types/database'

const url = import.meta.env.VITE_SUPABASE_URL?.trim()
const publishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim()

export const supabaseConfigured = Boolean(url && publishableKey)
export const supabase = supabaseConfigured
  ? createClient<Database>(url!, publishableKey!, {
      auth: { autoRefreshToken: true, persistSession: true, detectSessionInUrl: true },
    })
  : null

export function requireSupabase() {
  if (!supabase)
    throw new Error(
      'O acesso ainda não foi configurado. Configure as variáveis públicas do Supabase.',
    )
  return supabase
}
