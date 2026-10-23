import { Link } from 'react-router-dom'
import { ButtonLink } from '../../components/ui/ButtonLink'
import { StatusBadge } from '../../components/ui/StatusBadge'

const appointments = [
  {
    id: 'demo-patient-1',
    professional: 'Ana L.',
    day: '28',
    month: 'out',
    time: '14:00',
    status: 'confirmed' as const,
    label: 'Confirmado',
  },
  {
    id: 'demo-patient-2',
    professional: 'Marina C.',
    day: '04',
    month: 'nov',
    time: '10:30',
    status: 'pending' as const,
    label: 'Aguardando confirmação',
  },
]

export function PatientDashboardPage() {
  return (
    <section className="section inner-page dashboard-page">
      <div className="dashboard-heading">
        <div>
          <span className="eyebrow">Área do paciente · demonstração</span>
          <h1>Olá, Alex.</h1>
          <p className="page-intro">
            A agenda a seguir é fictícia e não está conectada a consultas reais.
          </p>
        </div>
        <ButtonLink to="/profissionais">
          Encontrar profissional <span aria-hidden="true">↗</span>
        </ButtonLink>
      </div>
      <div className="dashboard-notice">
        Os nomes, datas e status são exemplos. Não há conta conectada nem dados salvos.
      </div>
      <h2 className="subheading">Próximos encontros</h2>
      <div className="appointment-list">
        {appointments.map((item) => (
          <article className="appointment-row" key={item.id}>
            <div className="appointment-date">
              <strong>{item.day}</strong>
              <span>{item.month}</span>
            </div>
            <div className="appointment-details">
              <h3>Sessão online com {item.professional}</h3>
              <p>{item.time} · 50 minutos (demonstração)</p>
            </div>
            <StatusBadge status={item.status}>{item.label}</StatusBadge>
            <Link to="/sessao-online" className="text-link">
              Detalhes ↗
            </Link>
          </article>
        ))}
      </div>
      <div className="empty-cta">
        <h2>Precisa encontrar outro horário?</h2>
        <p>Explore perfis e horários demonstrativos. Não será feita nenhuma reserva.</p>
        <Link to="/agendar" className="text-link">
          Ver horários de demonstração ↗
        </Link>
      </div>
    </section>
  )
}
