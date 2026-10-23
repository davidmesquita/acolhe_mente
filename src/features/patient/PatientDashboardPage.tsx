import { useEffect, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../app/providers/useAuth'
import { Button } from '../../components/ui/Button'
import { FormField } from '../../components/ui/FormField'
import { Notice } from '../../components/ui/Notice'
import type { AppointmentSummary } from '../../types/database'
import { cancelAppointment, getMyAppointments, schedulingErrorMessage } from '../appointments/schedulingService'
import { updateDisplayName } from '../auth/authService'

const statusLabels = {
  requested: 'Solicitado',
  confirmed: 'Confirmado',
  cancelled: 'Cancelado',
  completed: 'Concluído',
} as const

function formatAppointment(date: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

export function PatientDashboardPage() {
  const auth = useAuth()
  const [name, setName] = useState(auth.profile?.display_name ?? '')
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const [appointments, setAppointments] = useState<AppointmentSummary[]>([])
  const [appointmentsLoading, setAppointmentsLoading] = useState(true)
  const [cancelling, setCancelling] = useState('')
  useEffect(() => {
    let active = true
    void getMyAppointments()
      .then((data) => {
        if (active) setAppointments(data)
      })
      .catch((cause: unknown) => {
        if (active) setError(schedulingErrorMessage(cause))
      })
      .finally(() => {
        if (active) setAppointmentsLoading(false)
        import { Link } from 'react-router-dom'
      })
    return () => {
      active = false
    }
  }, [])
  async function save(event: FormEvent) {
    event.preventDefault()
    setError('')
    setSuccess('')
    try {
      await updateDisplayName(name)
      await auth.refreshProfile()
      setSuccess('Nome atualizado.')
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Não foi possível salvar.')
    }
  }
  async function logout() {
    try {
      await auth.logout()
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Não foi possível sair.')
    }
  }
  async function cancel(id: string) {
    setCancelling(id)
    setError('')
    setSuccess('')
    try {
      await cancelAppointment(id)
      setAppointments(await getMyAppointments())
      setSuccess('Atendimento cancelado.')
    } catch (cause) {
      setError(schedulingErrorMessage(cause))
    } finally {
      setCancelling('')
    }
  }
  return (
    <section className="section inner-page dashboard-page">
      <span className="eyebrow">Área do paciente</span>
      <h1>Olá, {auth.profile?.display_name}.</h1>
      <p className="page-intro">Gerencie seu perfil e encontre profissionais para conhecer.</p>
      {success && (
        <Notice title="Tudo certo" kind="success">
          {success}
        </Notice>
      )}
      {error && (
        <Notice title="Não foi possível concluir" kind="error">
          {error}
        </Notice>
      )}
      <h2 className="subheading">Meus atendimentos</h2>
      {appointmentsLoading ? (
        <p role="status">Carregando atendimentos...</p>
      ) : appointments.length ? (
        <div className="appointment-list">
          {appointments.map((appointment) => (
            <article className="appointment-row" key={appointment.id}>
              <div className="appointment-date">
                <strong>{new Date(appointment.starts_at).toLocaleDateString('pt-BR', { day: '2-digit' })}</strong>
                <span>{new Date(appointment.starts_at).toLocaleDateString('pt-BR', { month: 'short' })}</span>
              </div>
              <div className="appointment-details">
                <h3>{appointment.other_party_name}</h3>
                <p>{formatAppointment(appointment.starts_at)} · {appointment.duration_minutes} min</p>
              </div>
              <span className={`status-badge status-${appointment.status}`}>{statusLabels[appointment.status]}</span>
              {['requested', 'confirmed'].includes(appointment.status) && new Date(appointment.starts_at) > new Date() ? (
                <div className="appointment-actions">
                  <Link className="text-link" to={`/agendar/${appointment.professional_id}`} state={{ rescheduleId: appointment.id }}>
                    Remarcar
                  </Link>
                  <Button type="button" variant="quiet" disabled={cancelling === appointment.id} onClick={() => void cancel(appointment.id)}>
                    {cancelling === appointment.id ? 'Cancelando...' : 'Cancelar'}
                  </Button>
                </div>
              ) : <span />}
            </article>
          ))}
        </div>
      ) : (
        <div className="empty-cta">
          <h2>Nenhum atendimento marcado</h2>
          <p>Encontre profissionais verificados e consulte os horários disponíveis.</p>
          <Link className="text-link" to="/profissionais">Ver profissionais ↗</Link>
        </div>
      )}
      <form className="auth-form" onSubmit={(event) => void save(event)}>
        <FormField
          label="Nome de exibição"
          name="display-name"
          autoComplete="name"
          value={name}
          maxLength={100}
          required
          onChange={(event) => setName(event.target.value)}
        />
        <Button type="submit">Salvar perfil</Button>
        <Button type="button" variant="quiet" onClick={() => void logout()}>
          Sair da conta
        </Button>
      </form>
    </section>
  )
}
