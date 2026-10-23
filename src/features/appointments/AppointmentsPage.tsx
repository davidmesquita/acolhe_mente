import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import { useAuth } from '../../app/providers/useAuth'
import { CalendarPicker } from '../../components/ui/CalendarPicker'
import { Button } from '../../components/ui/Button'
import { Notice } from '../../components/ui/Notice'
import { formatCurrency } from '../../lib/formatCurrency'
import type { AvailableSlot, SchedulerSettings, VerifiedProfessional } from '../../types/database'
import {
  getAvailableSlots,
  getProfessionalTimezone,
  getSchedulerSettings,
  getVerifiedProfessional,
  localDateInTimezone,
  requestAppointment,
  rescheduleAppointment,
  schedulingErrorMessage,
} from './schedulingService'

function dateLabel(value: string, timezone: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'full',
    timeStyle: 'short',
    timeZone: timezone,
  }).format(new Date(value))
}

export function AppointmentsPage() {
  const { professionalId } = useParams()
  const auth = useAuth()
  const location = useLocation()
  const [professional, setProfessional] = useState<VerifiedProfessional | null>(null)
  const [timezone, setTimezone] = useState('America/Sao_Paulo')
  const [settings, setSettings] = useState<SchedulerSettings | null>(null)
  const [slots, setSlots] = useState<AvailableSlot[]>([])
  const [selectedSlot, setSelectedSlot] = useState<AvailableSlot | null>(null)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [rescheduleId, setRescheduleId] = useState<string | null>(null)
  const idempotency = useRef<{ startsAt: string; key: string } | null>(null)

  useEffect(() => {
    const state = location.state as { rescheduleId?: string } | null
    setRescheduleId(state?.rescheduleId ?? null)
  }, [location.state])

  useEffect(() => {
    let active = true
    async function load() {
      setLoading(true)
      setError('')
      setSelectedSlot(null)
      setProfessional(null)
      setSlots([])
      setSettings(null)
      if (!professionalId) {
        setProfessional(null)
        setSlots([])
        setSettings(null)
        setError('Escolha um profissional verificado para consultar horários.')
        setLoading(false)
        return
      }
      try {
        const [profile, nextSettings, professionalTimezone] = await Promise.all([
          getVerifiedProfessional(professionalId),
          getSchedulerSettings(),
          getProfessionalTimezone(professionalId),
        ])
        if (!profile || !professionalTimezone) throw new Error('PROFESSIONAL_UNAVAILABLE')
        const today = localDateInTimezone(new Date(), professionalTimezone)
        const nextSlots = await getAvailableSlots(professionalId, today)
        if (!active) return
        setProfessional(profile)
        setSettings(nextSettings)
        setTimezone(professionalTimezone)
        setSlots(nextSlots)
      } catch (cause) {
        if (active)
          setError(
            cause instanceof Error && cause.message.includes('PROFESSIONAL_UNAVAILABLE')
              ? 'Este profissional não está disponível para agendamentos.'
              : schedulingErrorMessage(cause),
          )
      } finally {
        if (active) setLoading(false)
      }
    }
    void load()
    return () => {
      active = false
    }
  }, [professionalId])

  async function confirmBooking() {
    if (!professionalId || !selectedSlot) return
    setBusy(true)
    setError('')
    setSuccess('')
    try {
      const pendingRequest = idempotency.current?.startsAt === selectedSlot.starts_at
        ? idempotency.current
        : { startsAt: selectedSlot.starts_at, key: crypto.randomUUID() }
      idempotency.current = pendingRequest
      if (rescheduleId) {
        await rescheduleAppointment(rescheduleId, selectedSlot.starts_at, pendingRequest.key)
        setSuccess(`Atendimento remarcado para ${dateLabel(selectedSlot.starts_at, timezone)}.`)
        setRescheduleId(null)
      } else {
        await requestAppointment(professionalId, selectedSlot.starts_at, pendingRequest.key)
        setSuccess(`Solicitação enviada para ${dateLabel(selectedSlot.starts_at, timezone)}.`)
      }
      idempotency.current = null
      setSelectedSlot(null)
      setSlots((current) => current.filter((slot) => slot.starts_at !== selectedSlot.starts_at))
    } catch (cause) {
      setError(schedulingErrorMessage(cause))
      if (professionalId) {
        const today = localDateInTimezone(new Date(), timezone)
        try {
          setSlots(await getAvailableSlots(professionalId, today))
        } catch {
          setSlots((current) => current.filter((slot) => slot.starts_at !== selectedSlot.starts_at))
        }
      }
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="section inner-page booking-page">
      <span className="eyebrow">Agenda de atendimentos</span>
      <h1>
        Escolha com calma
        <br />
        <em>um bom momento.</em>
      </h1>
      <p className="page-intro">
        Horários atualizados em tempo real. A solicitação fica sujeita à confirmação do profissional.
      </p>
      {error && <Notice kind="error" title="Não foi possível carregar ou reservar">{error}</Notice>}
      {success && <Notice kind="success" title="Solicitação registrada">{success}</Notice>}
      <div className="booking-layout">
        <div>
          {professional ? (
            <div className="booking-person">
              <span className="mini-portrait portrait-sage" aria-hidden="true">
                {professional.display_name.slice(0, 2).toLocaleUpperCase('pt-BR')}
              </span>
              <div>
                <span className="eyebrow">Profissional verificado</span>
                <h2>{professional.display_name}</h2>
                <p>{professional.specialties.join(' · ') || 'Psicologia'}</p>
              </div>
            </div>
          ) : (
            <div className="booking-prompt">
              <h2>Escolha um profissional</h2>
              <Link to="/profissionais" className="text-link">
                Ver profissionais disponíveis ↗
              </Link>
            </div>
          )}
          {settings && (
            <div className="booking-price">
              <span>Sessão de {settings.duration_minutes} minutos</span>
              <strong>{formatCurrency(settings.price_cents / 100)}</strong>
            </div>
          )}
          {loading ? (
            <p role="status">Consultando horários...</p>
          ) : professional ? (
            <CalendarPicker
              slots={slots}
              timezone={timezone}
              onSelect={(slot) => {
                setSelectedSlot(slot)
                if (!slot) idempotency.current = null
              }}
            />
          ) : null}
          {selectedSlot && (
            <div className="booking-confirmation">
              <h2>{rescheduleId ? 'Confirme o reagendamento' : 'Confirme sua solicitação'}</h2>
              <p>{dateLabel(selectedSlot.starts_at, timezone)}</p>
              <p>
                {settings?.duration_minutes} minutos ·{' '}
                {formatCurrency((settings?.price_cents ?? selectedSlot.price_cents) / 100)}
              </p>
              {auth.profile?.role === 'patient' ? (
                <Button type="button" disabled={busy} onClick={() => void confirmBooking()}>
                  {busy ? 'Enviando...' : rescheduleId ? 'Confirmar reagendamento' : 'Solicitar agendamento'}
                </Button>
              ) : auth.user ? (
                <Notice title="Acesso de paciente necessário">
                  Apenas pacientes podem solicitar atendimentos.
                </Notice>
              ) : (
                <Link
                  to="/entrar"
                  state={{ from: { pathname: location.pathname } }}
                  className="button-link"
                >
                  Entre para solicitar
                </Link>
              )}
            </div>
          )}
        </div>
        <aside className="booking-aside">
          <span className="aside-icon" aria-hidden="true">♡</span>
          <h2>Seu espaço, no seu ritmo</h2>
          <p>
            A solicitação não representa uma cobrança. O valor e a duração são definidos pelo
            sistema; nenhum pagamento é realizado nesta etapa.
          </p>
          <p>Os horários são exibidos no fuso local do profissional. O banco guarda instantes UTC.</p>
          <Link to="/ajuda" className="text-link">Precisa de ajuda? ↗</Link>
        </aside>
      </div>
    </section>
  )
}