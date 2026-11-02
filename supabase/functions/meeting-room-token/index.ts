import { createClient } from 'npm:@supabase/supabase-js@2'

const allowedOrigin = Deno.env.get('APP_ALLOWED_ORIGIN')
const corsHeaders = {
  'Access-Control-Allow-Origin': allowedOrigin ?? '',
  'Access-Control-Allow-Headers': 'authorization, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Cache-Control': 'no-store',
  'Content-Type': 'application/json',
}

function reply(status: number, body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), { status, headers: corsHeaders })
}

function validUuid(value: unknown): value is string {
  return typeof value === 'string' &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
}

function base64Url(bytes: Uint8Array) {
  let binary = ''
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary).replaceAll('+', '-').replaceAll('/', '_').replaceAll('=', '')
}

function decodePrivateKey(pem: string) {
  const encoded = pem.replace(/-----BEGIN PRIVATE KEY-----|-----END PRIVATE KEY-----|\s/g, '')
  const binary = atob(encoded)
  return Uint8Array.from(binary, (character) => character.charCodeAt(0))
}

async function signJaasToken(input: {
  appId: string
  keyId: string
  privateKey: string
  userId: string
  displayName: string
  roomName: string
  moderator: boolean
  expiresAt: number
}) {
  const header = { alg: 'RS256', kid: `${input.appId}/${input.keyId}`, typ: 'JWT' }
  const issuedAt = Math.floor(Date.now() / 1000)
  const payload = {
    aud: 'jitsi',
    iss: 'chat',
    sub: input.appId,
    room: input.roomName,
    nbf: issuedAt - 5,
    exp: input.expiresAt,
    context: {
      user: {
        id: input.userId,
        name: input.displayName,
        ...(input.moderator ? { moderator: 'true' } : {}),
      },
      features: {
        recording: false,
        transcription: false,
        livestreaming: false,
        'outbound-call': false,
        'sip-outbound-call': false,
      },
    },
  }
  const encodedHeader = base64Url(new TextEncoder().encode(JSON.stringify(header)))
  const encodedPayload = base64Url(new TextEncoder().encode(JSON.stringify(payload)))
  const signingInput = `${encodedHeader}.${encodedPayload}`
  const key = await crypto.subtle.importKey(
    'pkcs8',
    decodePrivateKey(input.privateKey),
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const signature = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    key,
    new TextEncoder().encode(signingInput),
  )
  return `${signingInput}.${base64Url(new Uint8Array(signature))}`
}

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (request.method !== 'POST') return reply(405, { error: 'Método não permitido.' })
  if (!allowedOrigin) return reply(503, { error: 'Origem da aplicação não configurada.' })
  const requestOrigin = request.headers.get('Origin')
  if (requestOrigin && requestOrigin !== allowedOrigin)
    return reply(403, { error: 'Origem não autorizada.' })

  const url = Deno.env.get('SUPABASE_URL')
  const secret = Deno.env.get('APP_SUPABASE_SECRET_KEY')
  const publishable = Deno.env.get('APP_SUPABASE_PUBLISHABLE_KEY')
  const authorization = request.headers.get('Authorization')
  const accessToken = authorization?.match(/^Bearer\s+(.+)$/i)?.[1]
  if (!url || !secret || !publishable)
    return reply(503, { error: 'A autorização da sala não está configurada.' })
  if (!accessToken) return reply(401, { error: 'Entre na sua conta para continuar.' })

  try {
    const userClient = createClient(url, publishable, {
      global: { headers: { Authorization: `Bearer ${accessToken}` } },
      auth: { persistSession: false, autoRefreshToken: false },
    })
    const { data: authData, error: authError } = await userClient.auth.getUser(accessToken)
    if (authError || !authData.user) return reply(401, { error: 'Sessão inválida ou expirada.' })

    const body: unknown = await request.json()
    if (!body || typeof body !== 'object' || Array.isArray(body))
      return reply(400, { error: 'Solicitação inválida.' })
    const appointmentId = (body as Record<string, unknown>).appointmentId
    if (!validUuid(appointmentId)) return reply(400, { error: 'Agendamento inválido.' })

    const adminClient = createClient(url, secret, {
      auth: { persistSession: false, autoRefreshToken: false },
    })
    const [{ data: profile }, { data: appointment }] = await Promise.all([
      adminClient.from('profiles').select('role, display_name').eq('id', authData.user.id).maybeSingle(),
      adminClient
        .from('appointments')
        .select('id, patient_id, professional_id, starts_at, ends_at, status, is_demo')
        .eq('id', appointmentId)
        .maybeSingle(),
    ])

    const participant = Boolean(
      profile?.role === 'patient' && appointment?.patient_id === authData.user.id ||
      profile?.role === 'psychologist' && appointment?.professional_id === authData.user.id,
    )
    if (!appointment || !participant || !appointment.is_demo || appointment.status !== 'confirmed')
      return reply(404, { error: 'A sala não está disponível para este agendamento.' })

    const now = Date.now()
    const startsAt = Date.parse(appointment.starts_at)
    const endsAt = Date.parse(appointment.ends_at)
    const admissionOpensAt = startsAt - 15 * 60 * 1000
    const admissionClosesAt = endsAt + 15 * 60 * 1000
    if (now < admissionOpensAt || now > admissionClosesAt)
      return reply(403, { error: 'A sala só abre perto do horário do atendimento.' })

    if (Deno.env.get('DEMO_SESSIONS_ENABLED') !== 'true')
      return reply(503, { error: 'As salas de demonstração estão desativadas.' })
    const appId = Deno.env.get('JAAS_APP_ID')
    const keyId = Deno.env.get('JAAS_API_KEY_ID')
    const privateKey = Deno.env.get('JAAS_PRIVATE_KEY')
    if (!appId || !keyId || !privateKey)
      return reply(503, { error: 'O provedor de videochamada não está configurado.' })

    const roomName = `demo-${appointment.id}`
    const jaasRoomName = `${appId}/${roomName}`
    const expiresAt = Math.min(Math.floor(now / 1000) + 15 * 60, Math.floor(admissionClosesAt / 1000))
    const token = await signJaasToken({
      appId,
      keyId,
      privateKey,
      userId: authData.user.id,
      displayName: profile.display_name,
      roomName: jaasRoomName,
      moderator: profile.role === 'psychologist',
      expiresAt,
    })
    return reply(200, { appId, roomName, token, expiresAt })
  } catch {
    return reply(500, { error: 'Não foi possível autorizar a sala. Tente novamente.' })
  }
})