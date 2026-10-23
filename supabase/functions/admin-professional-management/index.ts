import { createClient } from 'npm:@supabase/supabase-js@2'

const allowedOrigin = Deno.env.get('APP_ALLOWED_ORIGIN')
const corsHeaders = {
  'Access-Control-Allow-Origin': allowedOrigin ?? '',
  'Access-Control-Allow-Headers': 'authorization, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json',
}

function reply(status: number, body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), { status, headers: corsHeaders })
}

function validUuid(value: unknown): value is string {
  return (
    typeof value === 'string' &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
  )
}

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (request.method !== 'POST') return reply(405, { error: 'Método não permitido.' })
  if (!allowedOrigin) return reply(503, { error: 'Origem administrativa não configurada.' })
  const requestOrigin = request.headers.get('Origin')
  if (requestOrigin && requestOrigin !== allowedOrigin)
    return reply(403, { error: 'Origem não autorizada.' })

  const url = Deno.env.get('SUPABASE_URL')
  const secret = Deno.env.get('APP_SUPABASE_SECRET_KEY')
  const publishable = Deno.env.get('APP_SUPABASE_PUBLISHABLE_KEY')
  const authorization = request.headers.get('Authorization')
  const token = authorization?.match(/^Bearer\s+(.+)$/i)?.[1]
  if (!url || !secret || !publishable)
    return reply(503, { error: 'Operação administrativa não configurada.' })
  if (!token) return reply(401, { error: 'Autenticação necessária.' })

  try {
    const userClient = createClient(url, publishable, {
      global: { headers: { Authorization: `Bearer ${token}` } },
      auth: { persistSession: false, autoRefreshToken: false },
    })
    const {
      data: { user },
      error: userError,
    } = await userClient.auth.getUser(token)
    if (userError || !user) return reply(401, { error: 'Sessão inválida ou expirada.' })

    const { data: ownProfile, error: roleError } = await userClient
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    if (roleError || ownProfile?.role !== 'admin')
      return reply(403, { error: 'Operação restrita.' })

    const body: unknown = await request.json()
    if (!body || typeof body !== 'object' || Array.isArray(body))
      return reply(400, { error: 'Solicitação inválida.' })
    const payload = body as Record<string, unknown>
    if (!validUuid(payload.userId)) return reply(400, { error: 'Identificador inválido.' })

    const adminClient = createClient(url, secret, {
      auth: { persistSession: false, autoRefreshToken: false },
    })
    if (payload.action === 'assign_psychologist') {
      const { data: target, error: targetError } = await adminClient
        .from('profiles')
        .select('role')
        .eq('id', payload.userId)
        .maybeSingle()
      if (targetError || !target || target.role === 'admin')
        return reply(400, { error: 'Conta não pode receber esta função.' })
      const { error: professionalError } = await adminClient
        .from('professional_profiles')
        .upsert({ id: payload.userId }, { onConflict: 'id', ignoreDuplicates: true })
      if (professionalError)
        return reply(400, { error: 'Não foi possível inicializar o perfil profissional.' })
      const { error: profileError } = await adminClient
        .from('profiles')
        .update({ role: 'psychologist' })
        .eq('id', payload.userId)
      if (profileError) return reply(400, { error: 'Não foi possível atualizar o perfil.' })
      return reply(200, { success: true })
    }

    if (
      payload.action === 'set_verification_status' &&
      ['pending', 'verified', 'rejected'].includes(String(payload.status))
    ) {
      const { data: target, error: targetError } = await adminClient
        .from('profiles')
        .select('role')
        .eq('id', payload.userId)
        .maybeSingle()
      if (targetError || target?.role !== 'psychologist')
        return reply(400, { error: 'Conta profissional não encontrada.' })
      const { error: verificationError } = await adminClient
        .from('professional_profiles')
        .update({ verification_status: payload.status as 'pending' | 'verified' | 'rejected' })
        .eq('id', payload.userId)
      if (verificationError)
        return reply(400, { error: 'Não foi possível atualizar a verificação.' })
      return reply(200, { success: true })
    }
    return reply(400, { error: 'Operação inválida.' })
  } catch {
    // Não registrar o corpo, e-mail, token ou dados de perfil em logs.
    return reply(400, { error: 'Solicitação inválida.' })
  }
})
