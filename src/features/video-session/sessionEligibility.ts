import type { AppointmentSummary } from '../../types/database'

export function canJoinDemoSession(appointment: AppointmentSummary, now = Date.now()) {
  return appointment.is_demo && appointment.status === 'confirmed' &&
    now >= Date.parse(appointment.starts_at) - 15 * 60 * 1000 &&
    now <= Date.parse(appointment.ends_at) + 15 * 60 * 1000
}