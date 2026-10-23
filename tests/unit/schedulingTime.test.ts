import { describe, expect, it } from 'vitest'
import { localDateInTimezone, zonedLocalDateTimeToUtc } from '../../src/features/appointments/schedulingService'

describe('conversão de horários da agenda', () => {
  it('armazena em UTC um horário local próximo da mudança de dia', () => {
    const utc = zonedLocalDateTimeToUtc('2026-10-24T23:30', 'America/Sao_Paulo')
    expect(utc).toBe('2026-10-25T02:30:00.000Z')
    expect(localDateInTimezone(new Date(utc), 'America/Sao_Paulo')).toBe('2026-10-24')
  })

  it('rejeita hora local inexistente durante a mudança de horário de verão', () => {
    expect(() => zonedLocalDateTimeToUtc('2026-03-08T02:30', 'America/New_York')).toThrow(
      'Essa data local não existe por causa da mudança de horário.',
    )
  })

  it('converte corretamente um horário em outro fuso', () => {
    expect(zonedLocalDateTimeToUtc('2026-10-24T23:30', 'UTC')).toBe('2026-10-24T23:30:00.000Z')
  })
})