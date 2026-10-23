import { useEffect, useState, type FormEvent } from 'react'
import { Button } from '../../components/ui/Button'
import { FormField } from '../../components/ui/FormField'
import { Notice } from '../../components/ui/Notice'
import type { ProfessionalAvailability, ScheduleException } from '../../types/database'
import {
  addScheduleException,
  getProfessionalAvailability,
  getScheduleExceptions,
  removeScheduleException,
  saveProfessionalAvailability,
  schedulingErrorMessage,
  zonedLocalDateTimeToUtc,
} from './schedulingService'

const weekdays = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado']
const timezoneOptions = [
  'America/Noronha',
  'America/Belem',
  'America/Fortaleza',
  'America/Recife',
  'America/Sao_Paulo',
  'America/Campo_Grande',
  'America/Manaus',
  'America/Rio_Branco',
  'UTC',
]
type DaySchedule = { enabled: boolean; starts_at: string; ends_at: string }

function formatException(exception: ScheduleException, timezone: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: timezone,
  }).formatRange(new Date(exception.starts_at), new Date(exception.ends_at))
}

export function ProfessionalScheduleEditor() {
  const [days, setDays] = useState<DaySchedule[]>(
    weekdays.map(() => ({ enabled: false, starts_at: '09:00', ends_at: '17:00' })),
  )
  const [timezone, setTimezone] = useState('America/Sao_Paulo')
  const [exceptions, setExceptions] = useState<ScheduleException[]>([])
  const [blockStart, setBlockStart] = useState('')
  const [blockEnd, setBlockEnd] = useState('')
  const [blockReason, setBlockReason] = useState('')
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  async function refreshExceptions() {
    setExceptions(await getScheduleExceptions())
  }

  useEffect(() => {
    let active = true
    void Promise.all([getProfessionalAvailability(), getScheduleExceptions()])
      .then(([availability, loadedExceptions]) => {
        if (!active) return
        setExceptions(loadedExceptions)
        if (availability.length) {
          setTimezone(availability[0]!.timezone)
          setDays((current) =>
            current.map((day, index) => {
              const saved = availability.find((entry) => entry.weekday === index)
              return saved
                ? { enabled: true, starts_at: saved.starts_at.slice(0, 5), ends_at: saved.ends_at.slice(0, 5) }
                : day
            }),
          )
        }
      })
      .catch((cause: unknown) => {
        if (active) setError(schedulingErrorMessage(cause))
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  async function saveSchedule(event: FormEvent) {
    event.preventDefault()
    setBusy(true)
    setError('')
    setSuccess('')
    try {
      const entries = days.flatMap((day, weekday) =>
        day.enabled ? [{ weekday, starts_at: day.starts_at, ends_at: day.ends_at, timezone }] : [],
      )
      await saveProfessionalAvailability(entries)
      const refreshed: ProfessionalAvailability[] = await getProfessionalAvailability()
      if (refreshed.length) setTimezone(refreshed[0]!.timezone)
      setSuccess('Disponibilidade semanal salva.')
    } catch (cause) {
      setError(schedulingErrorMessage(cause))
    } finally {
      setBusy(false)
    }
  }

  async function addBlock(event: FormEvent) {
    event.preventDefault()
    setBusy(true)
    setError('')
    setSuccess('')
    try {
      const start = zonedLocalDateTimeToUtc(blockStart, timezone)
      const end = zonedLocalDateTimeToUtc(blockEnd, timezone)
      if (new Date(start) >= new Date(end)) throw new Error('O fim do bloqueio deve ser posterior ao início.')
      await addScheduleException(start, end, blockReason.trim())
      await refreshExceptions()
      setBlockStart('')
      setBlockEnd('')
      setBlockReason('')
      setSuccess('Bloqueio adicionado à agenda.')
    } catch (cause) {
      setError(schedulingErrorMessage(cause))
    } finally {
      setBusy(false)
    }
  }

  async function removeBlock(id: string) {
    setBusy(true)
    setError('')
    setSuccess('')
    try {
      await removeScheduleException(id)
      await refreshExceptions()
      setSuccess('Bloqueio removido.')
    } catch (cause) {
      setError(schedulingErrorMessage(cause))
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="schedule-editor" aria-labelledby="schedule-heading">
      <h2 id="schedule-heading" className="subheading">Disponibilidade e bloqueios</h2>
      <p className="muted-copy">Defina uma faixa por dia da semana. O sistema divide os horários conforme a duração da sessão.</p>
      {error && <Notice kind="error" title="Não foi possível salvar">{error}</Notice>}
      {success && <Notice kind="success" title="Agenda atualizada">{success}</Notice>}
      {loading ? <p role="status">Carregando disponibilidade...</p> : (
        <form className="schedule-form" onSubmit={(event) => void saveSchedule(event)}>
          <div className="form-field">
            <label htmlFor="schedule-timezone">Fuso horário da agenda</label>
            <div className="input-wrap">
              <select id="schedule-timezone" value={timezone} onChange={(event) => setTimezone(event.target.value)}>
                {timezoneOptions.map((zone) => <option key={zone} value={zone}>{zone}</option>)}
              </select>
            </div>
          </div>
          <div className="weekday-schedule">
            {days.map((day, index) => (
              <div className="weekday-row" key={weekdays[index]}>
                <label>
                  <input
                    type="checkbox"
                    checked={day.enabled}
                    onChange={(event) => setDays((current) => current.map((value, dayIndex) =>
                      dayIndex === index ? { ...value, enabled: event.target.checked } : value,
                    ))}
                  />
                  <span>{weekdays[index]}</span>
                </label>
                <input
                  aria-label={`Início ${weekdays[index]}`}
                  type="time"
                  value={day.starts_at}
                  disabled={!day.enabled}
                  onChange={(event) => setDays((current) => current.map((value, dayIndex) =>
                    dayIndex === index ? { ...value, starts_at: event.target.value } : value,
                  ))}
                />
                <span aria-hidden="true">até</span>
                <input
                  aria-label={`Fim ${weekdays[index]}`}
                  type="time"
                  value={day.ends_at}
                  disabled={!day.enabled}
                  onChange={(event) => setDays((current) => current.map((value, dayIndex) =>
                    dayIndex === index ? { ...value, ends_at: event.target.value } : value,
                  ))}
                />
              </div>
            ))}
          </div>
          <Button type="submit" disabled={busy}>{busy ? 'Salvando...' : 'Salvar disponibilidade'}</Button>
        </form>
      )}
      <div className="schedule-blocks">
        <h3>Exceções e bloqueios</h3>
        <p className="muted-copy">As datas e horas abaixo usam {timezone}.</p>
        <form className="block-form" onSubmit={(event) => void addBlock(event)}>
          <FormField label="Início" name="block-start" type="datetime-local" value={blockStart} required onChange={(event) => setBlockStart(event.target.value)} />
          <FormField label="Fim" name="block-end" type="datetime-local" value={blockEnd} required onChange={(event) => setBlockEnd(event.target.value)} />
          <FormField label="Motivo (opcional)" name="block-reason" value={blockReason} maxLength={160} onChange={(event) => setBlockReason(event.target.value)} />
          <Button type="submit" variant="secondary" disabled={busy}>Adicionar bloqueio</Button>
        </form>
        {exceptions.length ? (
          <ul className="schedule-exception-list">
            {exceptions.map((exception) => (
              <li key={exception.id}>
                <span>{formatException(exception, timezone)}{exception.reason ? ` · ${exception.reason}` : ''}</span>
                <Button type="button" variant="quiet" disabled={busy} onClick={() => void removeBlock(exception.id)}>Remover</Button>
              </li>
            ))}
          </ul>
        ) : <p className="muted-copy">Nenhum bloqueio futuro.</p>}
      </div>
    </section>
  )
}