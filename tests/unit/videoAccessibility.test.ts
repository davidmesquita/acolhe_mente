import { describe, expect, it } from 'vitest'
import { splitSpeechResults } from '../../src/features/captions/speechResults'
import { canJoinDemoSession } from '../../src/features/video-session/sessionEligibility'
import type { AppointmentSummary } from '../../src/types/database'

describe('legendas e salas de demonstração', () => {
  it('mantém resultados parciais separados dos finais', () => {
    const result = splitSpeechResults({
      resultIndex: 0,
      results: [
        { isFinal: true, 0: { transcript: ' Olá, teste. ' } },
        { isFinal: false, 0: { transcript: 'fala parcial' } },
      ],
    })
    expect(result.final).toEqual(['Olá, teste.'])
    expect(result.partial).toEqual(['fala parcial'])
  })

  it('só abre o acesso visual no período de agendamento demo confirmado', () => {
    const startsAt = '2026-10-24T12:00:00.000Z'
    const appointment: AppointmentSummary = {
      id: '20000000-0000-4000-8000-000000000001',
      starts_at: startsAt,
      ends_at: '2026-10-24T12:50:00.000Z',
      price_cents: 5000,
      duration_minutes: 50,
      status: 'confirmed',
      other_party_name: 'Conta de teste',
      timezone: 'UTC',
      professional_id: '20000000-0000-4000-8000-000000000002',
      is_demo: true,
    }
    expect(canJoinDemoSession(appointment, Date.parse('2026-10-24T11:50:00.000Z'))).toBe(true)
    expect(canJoinDemoSession(appointment, Date.parse('2026-10-24T12:30:00.000Z'))).toBe(true)
    expect(canJoinDemoSession({ ...appointment, is_demo: false }, Date.parse('2026-10-24T12:30:00.000Z'))).toBe(false)
    expect(canJoinDemoSession({ ...appointment, status: 'requested' }, Date.parse('2026-10-24T12:30:00.000Z'))).toBe(false)
    expect(canJoinDemoSession(appointment, Date.parse('2026-10-24T13:10:00.000Z'))).toBe(false)
  })
})