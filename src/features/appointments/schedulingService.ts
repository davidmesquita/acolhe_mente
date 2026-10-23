import { requireSupabase } from '../../lib/supabaseClient'
import type {
  AppointmentSummary,
  AvailableSlot,
  ProfessionalAvailability,
  ScheduleException,
  SchedulerSettings,
  VerifiedProfessional,
} from '../../types/database'

export type AvailabilityInput = Pick<
  ProfessionalAvailability,
  'weekday' | 'starts_at' | 'ends_at' | 'timezone'
>

export async function getSchedulerSettings(): Promise<SchedulerSettings> {
  const { data, error } = await requireSupabase().rpc('get_scheduler_settings')
  if (error) throw error
  const settings = data[0]
  if (!settings) throw new Error('As configurações de agenda não estão disponíveis.')
  return settings
}

export async function getVerifiedProfessional(professionalId: string) {
  const { data, error } = await requireSupabase()
    .from('verified_professional_profiles')
    .select('id, display_name, presentation, specialties, registration_number, accessibility_modalities')
    .eq('id', professionalId)
    .maybeSingle()
  if (error) throw error
  return data as VerifiedProfessional | null
}

export async function getAvailableSlots(professionalId: string, localDate: string) {
  const { data, error } = await requireSupabase().rpc('get_available_slots', {
    professional_uuid: professionalId,
    local_date: localDate,
  })
  if (error) throw error
  return data as AvailableSlot[]
}

export async function requestAppointment(professionalId: string, startsAt: string, requestKey: string) {
  const { data, error } = await requireSupabase().rpc('request_appointment', {
    professional_uuid: professionalId,
    slot_start: startsAt,
    request_key: requestKey,
  })
  if (error) throw error
  return data
}

export async function getMyAppointments() {
  const { data, error } = await requireSupabase().rpc('get_my_appointments')
  if (error) throw error
  return data as AppointmentSummary[]
}

export async function cancelAppointment(appointmentId: string) {
  const { error } = await requireSupabase().rpc('cancel_appointment', {
    appointment_uuid: appointmentId,
  })
  if (error) throw error
}

export async function updateAppointmentStatus(
  appointmentId: string,
  nextStatus: 'confirmed' | 'cancelled' | 'completed',
) {
  const { error } = await requireSupabase().rpc('set_appointment_status', {
    appointment_uuid: appointmentId,
    next_status: nextStatus,
  })
  if (error) throw error
}

export async function getProfessionalAvailability() {
  const { data, error } = await requireSupabase()
    .from('professional_availability')
    .select('*')
    .order('weekday')
  if (error) throw error
  return data as ProfessionalAvailability[]
}

export async function saveProfessionalAvailability(entries: AvailabilityInput[]) {
  const { error } = await requireSupabase().rpc('save_professional_availability', {
    availability: entries,
  })
  if (error) throw error
}

export async function getScheduleExceptions() {
  const { data, error } = await requireSupabase()
    .from('schedule_exceptions')
    .select('*')
    .gte('ends_at', new Date().toISOString())
    .order('starts_at')
  if (error) throw error
  return data as ScheduleException[]
}

export async function addScheduleException(startsAt: string, endsAt: string, reason = '') {
  const client = requireSupabase()
  const {
    data: { user },
    error: userError,
  } = await client.auth.getUser()
  if (userError || !user) throw userError ?? new Error('Entre novamente para bloquear horários.')
  const { error } = await client.from('schedule_exceptions').insert({
    professional_id: user.id,
    starts_at: startsAt,
    ends_at: endsAt,
    reason,
  })
  if (error) throw error
}

export async function removeScheduleException(exceptionId: string) {
  const { error } = await requireSupabase()
    .from('schedule_exceptions')
    .delete()
    .eq('id', exceptionId)
  if (error) throw error
}

export function schedulingErrorMessage(error: unknown) {
  const message = error instanceof Error ? error.message : ''
  if (message.includes('SLOT_UNAVAILABLE') || message.includes('exclusion'))
    return 'Esse horário acabou de ficar indisponível. Escolha outro horário.'
  if (message.includes('CANCELLATION_WINDOW_CLOSED'))
    return 'O prazo para cancelamento pela plataforma já terminou. Fale com o profissional.'
  if (message.includes('BLOCK_OVERLAPS_APPOINTMENT'))
    return 'O bloqueio não pode incluir um atendimento já solicitado ou confirmado.'
  if (message.includes('INVALID_APPOINTMENT_TRANSITION'))
    return 'Essa alteração de status não é permitida para este atendimento.'
  return message || 'Não foi possível concluir a operação. Tente novamente.'
}

export function localDateInTimezone(date: Date, timezone: string) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date)
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]))
  return `${values.year}-${values.month}-${values.day}`
}

export function zonedLocalDateTimeToUtc(localDateTime: string, timezone: string) {
  const [datePart, timePart] = localDateTime.split('T')
  if (!datePart || !timePart) throw new Error('Informe uma data e hora válidas.')
  const [year, month, day] = datePart.split('-').map(Number)
  const [hour, minute] = timePart.split(':').map(Number)
  const target = Date.UTC(year!, month! - 1, day!, hour!, minute!)
  let guess = target
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const parts = new Intl.DateTimeFormat('en-CA', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
    }).formatToParts(new Date(guess))
    const values = Object.fromEntries(parts.map((part) => [part.type, Number(part.value)]))
    const represented = Date.UTC(
      values.year!,
      values.month! - 1,
      values.day!,
      values.hour!,
      values.minute!,
    )
    guess += target - represented
  }
  const result = new Date(guess)
  const resultingLocalTime = new Intl.DateTimeFormat('sv-SE', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).format(result).replace(' ', 'T')
  if (resultingLocalTime !== `${datePart}T${timePart}`)
    throw new Error('Essa data local não existe por causa da mudança de horário.')
  return result.toISOString()
}

export async function getProfessionalTimezone(professionalId: string) {
  const { data, error } = await requireSupabase().rpc('get_professional_timezone', {
    professional_uuid: professionalId,
  })
  if (error) throw error
  return data
}

export async function rescheduleAppointment(appointmentId: string, startsAt: string, requestKey: string) {
  const { data, error } = await requireSupabase().rpc('reschedule_appointment', {
    appointment_uuid: appointmentId,
    slot_start: startsAt,
    request_key: requestKey,
  })
  if (error) throw error
  return data
}