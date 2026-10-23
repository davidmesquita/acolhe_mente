import { createClient } from '@supabase/supabase-js'
import { it, expect } from 'vitest'

const environment = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env ?? {}
const supabaseUrl = environment.SUPABASE_TEST_URL ?? ''
const secretKey = environment.SUPABASE_TEST_SECRET_KEY ?? ''
const publishableKey = environment.SUPABASE_TEST_PUBLISHABLE_KEY ?? ''
const isLocalSupabase = /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(supabaseUrl)
const shouldRun = Boolean(isLocalSupabase && secretKey && publishableKey)

it.skipIf(!shouldRun)('aceita somente uma de duas reservas simultâneas para o mesmo horário', async () => {
  const admin = createClient(supabaseUrl, secretKey, { auth: { persistSession: false } })
  const suffix = crypto.randomUUID()
  const password = `Teste-${crypto.randomUUID()}-A9!`
  const createdUserIds: string[] = []
  try {
    const created = await Promise.all(
      ['patient-a', 'patient-b', 'psychologist'].map((role) =>
        admin.auth.admin.createUser({
          email: `${role}-${suffix}@example.test`,
          password,
          email_confirm: true,
          user_metadata: { display_name: `Teste ${role}` },
        }),
      ),
    )
    for (const result of created) {
      if (result.data.user) createdUserIds.push(result.data.user.id)
    }
    const creationError = created.find((result) => result.error)
    if (creationError?.error) throw creationError.error
    if (createdUserIds.length !== 3) throw new Error('Contas sintéticas incompletas.')
    const [patientA, patientB, professional] = createdUserIds
    const testDate = new Date()
    testDate.setUTCDate(testDate.getUTCDate() + 2)
    const localDate = testDate.toISOString().slice(0, 10)

    const { error: roleError } = await admin
      .from('profiles')
      .update({ role: 'psychologist' })
      .eq('id', professional!)
    if (roleError) throw roleError

    const { error: profileError } = await admin.from('professional_profiles').upsert({
      id: professional!,
      presentation: 'Perfil sintético do teste de concorrência.',
      specialties: [],
      accessibility_modalities: [],
      verification_status: 'verified',
    })
    if (profileError) throw profileError

    const { error: availabilityError } = await admin.from('professional_availability').insert({
      professional_id: professional!,
      weekday: testDate.getUTCDay(),
      starts_at: '22:00:00',
      ends_at: '23:40:00',
      timezone: 'UTC',
    })
    if (availabilityError) throw availabilityError

    const { data: slots, error: slotsError } = await admin.rpc('get_available_slots', {
      professional_uuid: professional!,
      local_date: localDate,
    })
    if (slotsError) throw slotsError
    const targetSlot = slots[0]
    if (!targetSlot) throw new Error('A agenda sintética não gerou horário de teste.')

    const patientClients = await Promise.all(
      [`patient-a-${suffix}@example.test`, `patient-b-${suffix}@example.test`].map(async (email) => {
        const client = createClient(supabaseUrl, publishableKey, { auth: { persistSession: false } })
        const { error } = await client.auth.signInWithPassword({ email, password })
        if (error) throw error
        return client
      }),
    )
    const simultaneousResults = await Promise.all(
      patientClients.map((client) =>
        client.rpc('request_appointment', {
          professional_uuid: professional!,
          slot_start: targetSlot.starts_at,
          request_key: crypto.randomUUID(),
        }),
      ),
    )

    expect(simultaneousResults.filter((result) => !result.error)).toHaveLength(1)
    expect(simultaneousResults.filter((result) => result.error)).toHaveLength(1)
    const { count, error: countError } = await admin
      .from('appointments')
      .select('id', { count: 'exact', head: true })
      .eq('professional_id', professional!)
      .in('status', ['requested', 'confirmed'])
    if (countError) throw countError
    expect(count).toBe(1)
  } finally {
    if (createdUserIds.length) {
      await admin.from('appointments').delete().in('patient_id', createdUserIds)
      await admin.from('appointments').delete().in('professional_id', createdUserIds)
    }
    await Promise.all(createdUserIds.map((userId) => admin.auth.admin.deleteUser(userId)))
  }
}, 30_000)