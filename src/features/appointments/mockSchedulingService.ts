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

// Mock data store
const mockProfessionals: VerifiedProfessional[] = [
  {
    id: 'mock-psychologist-id',
    display_name: 'Dra. Marina Costa',
    presentation: 'Psicóloga clínica com 10 anos de experiência em terapia cognitivo-comportamental e abordagem humanista.',
    specialties: ['Ansiedade', 'Depressão', 'Terapia Cognitivo-Comportamental', 'Relacionamentos'],
    registration_number: 'CRP 06/123456',
    accessibility_modalities: ['Legendas em tempo real', 'Comunicação por texto'],
  },
  {
    id: 'mock-psychologist-2',
    display_name: 'Dr. Rafael Almeida',
    presentation: 'Especialista em terapia de casal e familiar. Abordagem sistêmica com foco em comunicação não violenta.',
    specialties: ['Terapia de Casal', 'Terapia Familiar', 'Comunicação', 'Conflitos'],
    registration_number: 'CRP 08/789012',
    accessibility_modalities: ['Atendimento presencial'],
  },
  {
    id: 'mock-psychologist-3',
    display_name: 'Dra. Ana Beatriz Lima',
    presentation: 'Foco em transtornos alimentares, autoestima e imagem corporal. Abordagem integrativa.',
    specialties: ['Transtornos Alimentares', 'Autoestima', 'Imagem Corporal', 'Ansiedade'],
    registration_number: 'CRP 12/345678',
    accessibility_modalities: ['Legendas em tempo real'],
  },
]

const mockSchedulerSettings: SchedulerSettings & { id: boolean; updated_at: string } = {
  id: true,
  price_cents: 15000,
  duration_minutes: 50,
  cancellation_notice_hours: 24,
  updated_at: new Date().toISOString(),
}

const mockAvailability: ProfessionalAvailability[] = [
  { id: 'av-1', professional_id: 'mock-psychologist-id', weekday: 1, starts_at: '09:00', ends_at: '12:00', timezone: 'America/Sao_Paulo', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'av-2', professional_id: 'mock-psychologist-id', weekday: 1, starts_at: '14:00', ends_at: '18:00', timezone: 'America/Sao_Paulo', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'av-3', professional_id: 'mock-psychologist-id', weekday: 2, starts_at: '09:00', ends_at: '12:00', timezone: 'America/Sao_Paulo', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'av-4', professional_id: 'mock-psychologist-id', weekday: 2, starts_at: '14:00', ends_at: '18:00', timezone: 'America/Sao_Paulo', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'av-5', professional_id: 'mock-psychologist-id', weekday: 3, starts_at: '09:00', ends_at: '12:00', timezone: 'America/Sao_Paulo', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'av-6', professional_id: 'mock-psychologist-id', weekday: 3, starts_at: '14:00', ends_at: '18:00', timezone: 'America/Sao_Paulo', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'av-7', professional_id: 'mock-psychologist-id', weekday: 4, starts_at: '09:00', ends_at: '12:00', timezone: 'America/Sao_Paulo', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'av-8', professional_id: 'mock-psychologist-id', weekday: 4, starts_at: '14:00', ends_at: '18:00', timezone: 'America/Sao_Paulo', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'av-9', professional_id: 'mock-psychologist-id', weekday: 5, starts_at: '09:00', ends_at: '12:00', timezone: 'America/Sao_Paulo', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'av-10', professional_id: 'mock-psychologist-id', weekday: 5, starts_at: '14:00', ends_at: '18:00', timezone: 'America/Sao_Paulo', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },

  { id: 'av-11', professional_id: 'mock-psychologist-2', weekday: 2, starts_at: '08:00', ends_at: '12:00', timezone: 'America/Sao_Paulo', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'av-12', professional_id: 'mock-psychologist-2', weekday: 3, starts_at: '08:00', ends_at: '12:00', timezone: 'America/Sao_Paulo', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'av-13', professional_id: 'mock-psychologist-2', weekday: 4, starts_at: '08:00', ends_at: '12:00', timezone: 'America/Sao_Paulo', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'av-14', professional_id: 'mock-psychologist-2', weekday: 5, starts_at: '08:00', ends_at: '12:00', timezone: 'America/Sao_Paulo', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },

  { id: 'av-15', professional_id: 'mock-psychologist-3', weekday: 1, starts_at: '13:00', ends_at: '17:00', timezone: 'America/Sao_Paulo', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'av-16', professional_id: 'mock-psychologist-3', weekday: 3, starts_at: '13:00', ends_at: '17:00', timezone: 'America/Sao_Paulo', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'av-17', professional_id: 'mock-psychologist-3', weekday: 5, starts_at: '13:00', ends_at: '17:00', timezone: 'America/Sao_Paulo', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
]

const mockExceptions: ScheduleException[] = [
  { id: 'exc-1', professional_id: 'mock-psychologist-id', starts_at: '2026-11-15T14:00:00Z', ends_at: '2026-11-15T18:00:00Z', reason: 'Congresso', created_at: new Date().toISOString() },
]

const mockAppointments: AppointmentSummary[] = [
  {
    id: 'apt-1',
    starts_at: '2026-11-10T14:00:00Z',
    ends_at: '2026-11-10T14:50:00Z',
    price_cents: 15000,
    duration_minutes: 50,
    status: 'confirmed',
    other_party_name: 'Alex Cliente',
    timezone: 'America/Sao_Paulo',
    professional_id: 'mock-psychologist-id',
    is_demo: false,
  },
  {
    id: 'apt-2',
    starts_at: '2026-11-10T15:00:00Z',
    ends_at: '2026-11-10T15:50:00Z',
    price_cents: 15000,
    duration_minutes: 50,
    status: 'requested',
    other_party_name: 'João Silva',
    timezone: 'America/Sao_Paulo',
    professional_id: 'mock-psychologist-id',
    is_demo: false,
  },
  {
    id: 'apt-3',
    starts_at: '2026-11-11T09:00:00Z',
    ends_at: '2026-11-11T09:50:00Z',
    price_cents: 15000,
    duration_minutes: 50,
    status: 'confirmed',
    other_party_name: 'Maria Santos',
    timezone: 'America/Sao_Paulo',
    professional_id: 'mock-psychologist-id',
    is_demo: false,
  },
  {
    id: 'apt-4',
    starts_at: '2026-11-12T10:00:00Z',
    ends_at: '2026-11-12T10:50:00Z',
    price_cents: 12000,
    duration_minutes: 50,
    status: 'confirmed',
    other_party_name: 'Dra. Marina Costa',
    timezone: 'America/Sao_Paulo',
    professional_id: 'mock-psychologist-2',
    is_demo: false,
  },
]

let availabilityStore = [...mockAvailability]
let exceptionsStore = [...mockExceptions]
let appointmentsStore = [...mockAppointments]
let schedulerSettingsStore = { ...mockSchedulerSettings }

function generateSlotsForDate(professionalId: string, localDate: string): AvailableSlot[] {
  const date = new Date(localDate + 'T00:00:00')
  const weekday = date.getDay()
  const professionalAvail = availabilityStore.filter(a => a.professional_id === professionalId && a.weekday === weekday)
  const dayExceptions = exceptionsStore.filter(e =>
    e.professional_id === professionalId &&
    new Date(e.starts_at) <= new Date(localDate + 'T23:59:59') &&
    new Date(e.ends_at) >= new Date(localDate + 'T00:00:00')
  )

  const slots: AvailableSlot[] = []
  const settings = schedulerSettingsStore
  const slotDuration = settings.duration_minutes

  for (const avail of professionalAvail) {
    const [startHour, startMin] = avail.starts_at.split(':').map(Number)
    const [endHour, endMin] = avail.ends_at.split(':').map(Number)

    let current = new Date(date)
    current.setHours(startHour, startMin, 0, 0)
    const endTime = new Date(date)
    endTime.setHours(endHour, endMin, 0, 0)

    while (current.getTime() + slotDuration * 60000 <= endTime.getTime()) {
      const slotStart = new Date(current)
      const slotEnd = new Date(current.getTime() + slotDuration * 60000)

      const isBlocked = dayExceptions.some(exc =>
        new Date(exc.starts_at) < slotEnd && new Date(exc.ends_at) > slotStart
      )

      const isBooked = appointmentsStore.some(apt =>
        apt.professional_id === professionalId &&
        apt.starts_at === slotStart.toISOString() &&
        (apt.status === 'confirmed' || apt.status === 'requested')
      )

      if (!isBlocked && !isBooked) {
        slots.push({
          starts_at: slotStart.toISOString(),
          ends_at: slotEnd.toISOString(),
          timezone: avail.timezone,
          price_cents: settings.price_cents,
          duration_minutes: settings.duration_minutes,
        })
      }
      current = slotEnd
    }
  }
  return slots
}

export async function getSchedulerSettings(): Promise<SchedulerSettings> {
  return { ...schedulerSettingsStore }
}

export async function getVerifiedProfessional(professionalId: string) {
  return mockProfessionals.find(p => p.id === professionalId) ?? null
}

export async function getVerifiedProfessionals(): Promise<VerifiedProfessional[]> {
  return [...mockProfessionals]
}

export { getVerifiedProfessionals as getVerifiedProfessionalsExport }

export async function getAvailableSlots(professionalId: string, localDate: string) {
  return generateSlotsForDate(professionalId, localDate)
}

export async function requestAppointment(professionalId: string, slotStart: string, _requestKey: string) {
  const slot = new Date(slotStart)
  const settings = schedulerSettingsStore
  const newAppointment: AppointmentSummary = {
    id: `apt-${Date.now()}`,
    starts_at: slotStart,
    ends_at: new Date(slot.getTime() + settings.duration_minutes * 60000).toISOString(),
    price_cents: settings.price_cents,
    duration_minutes: settings.duration_minutes,
    status: 'requested',
    other_party_name: 'Alex Cliente',
    timezone: 'America/Sao_Paulo',
    professional_id: professionalId,
    is_demo: false,
  }
  appointmentsStore.push(newAppointment)
  return newAppointment.id
}

export async function getMyAppointments(): Promise<AppointmentSummary[]> {
  const auth = await import('../../app/providers/useAuth').then(m => m.useAuth())
  const userId = auth.profile?.id
  if (!userId) return []

  const isPsychologist = auth.profile?.role === 'psychologist'

  return appointmentsStore
    .filter(apt => isPsychologist ? apt.professional_id === userId : apt.other_party_name === 'Alex Cliente')
    .sort((a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime())
}

export async function cancelAppointment(appointmentId: string) {
  const idx = appointmentsStore.findIndex(a => a.id === appointmentId)
  if (idx >= 0) appointmentsStore[idx].status = 'cancelled'
}

export async function updateAppointmentStatus(appointmentId: string, nextStatus: 'confirmed' | 'cancelled' | 'completed') {
  const idx = appointmentsStore.findIndex(a => a.id === appointmentId)
  if (idx >= 0) appointmentsStore[idx].status = nextStatus
}

export async function rescheduleAppointment(appointmentId: string, slotStart: string, _requestKey: string) {
  const idx = appointmentsStore.findIndex(a => a.id === appointmentId)
  if (idx >= 0) {
    const settings = schedulerSettingsStore
    appointmentsStore[idx].starts_at = slotStart
    appointmentsStore[idx].ends_at = new Date(new Date(slotStart).getTime() + settings.duration_minutes * 60000).toISOString()
    appointmentsStore[idx].status = 'requested'
  }
  return appointmentId
}

export async function getProfessionalAvailability() {
  return [...availabilityStore]
}

export async function saveProfessionalAvailability(entries: AvailabilityInput[]) {
  const auth = await import('../../app/providers/useAuth').then(m => m.useAuth())
  const userId = auth.profile?.id
  if (!userId) throw new Error('Não autenticado')

  availabilityStore = availabilityStore.filter(a => a.professional_id !== userId)

  for (const entry of entries) {
    availabilityStore.push({
      id: `av-${Date.now()}-${Math.random()}`,
      professional_id: userId,
      weekday: entry.weekday,
      starts_at: entry.starts_at,
      ends_at: entry.ends_at,
      timezone: entry.timezone,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
  }
}

export async function getScheduleExceptions() {
  const auth = await import('../../app/providers/useAuth').then(m => m.useAuth())
  const userId = auth.profile?.id
  if (!userId) return []
  return exceptionsStore.filter(e => e.professional_id === userId && new Date(e.ends_at) >= new Date())
}

export async function addScheduleException(startsAt: string, endsAt: string, reason = '') {
  const auth = await import('../../app/providers/useAuth').then(m => m.useAuth())
  const userId = auth.profile?.id
  if (!userId) throw new Error('Não autenticado')

  exceptionsStore.push({
    id: `exc-${Date.now()}`,
    professional_id: userId,
    starts_at: startsAt,
    ends_at: endsAt,
    reason,
    created_at: new Date().toISOString(),
  })
}

export async function removeScheduleException(exceptionId: string) {
  exceptionsStore = exceptionsStore.filter(e => e.id !== exceptionId)
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
  const prof = availabilityStore.find(a => a.professional_id === professionalId)
  return prof?.timezone ?? 'America/Sao_Paulo'
}

export function resetMockData() {
  availabilityStore = [...mockAvailability]
  exceptionsStore = [...mockExceptions]
  appointmentsStore = [...mockAppointments]
  schedulerSettingsStore = { ...mockSchedulerSettings }
}