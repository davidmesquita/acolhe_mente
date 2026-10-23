import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { CalendarPicker } from '../../components/ui/CalendarPicker'
import { Notice } from '../../components/ui/Notice'
import { professionals } from '../professionals/data'

export function AppointmentsPage() {
  const { professionalId } = useParams()
  const person = professionals.find((candidate) => candidate.id === professionalId)
  const [selection, setSelection] = useState('')
  return (
    <section className="section inner-page booking-page">
      <span className="eyebrow">Agendamento demonstrativo</span>
      <h1>
        Escolha com calma
        <br />
        <em>um bom momento.</em>
      </h1>
      <p className="page-intro">
        Nenhuma solicitação será enviada ou armazenada. Datas e horários abaixo são exemplos locais.
      </p>
      <div className="booking-layout">
        <div>
          {person ? (
            <div className="booking-person">
              <span className={`mini-portrait portrait-${person.color}`}>{person.initials}</span>
              <div>
                <span className="eyebrow">Profissional fictício</span>
                <h2>{person.name}</h2>
                <p>{person.focus}</p>
              </div>
            </div>
          ) : (
            <div className="booking-prompt">
              <h2>Escolha um profissional</h2>
              <Link to="/profissionais" className="text-link">
                Ver perfis de demonstração ↗
              </Link>
            </div>
          )}
          <div className="booking-price">
            <span>Valor social demonstrativo</span>
            <strong>
              R$ 50 <small>/ sessão</small>
            </strong>
          </div>
          <CalendarPicker onSelect={(date, time) => setSelection(`${date} às ${time}`)} />
        </div>
        <aside className="booking-aside">
          <span className="aside-icon" aria-hidden="true">
            ♡
          </span>
          <h2>Seu espaço, no seu ritmo</h2>
          <p>
            Esta tela mostra apenas a experiência de escolha de horário. Ainda não existe
            confirmação de consulta, pagamento ou conexão clínica.
          </p>
          <p>Não compartilhe dados pessoais ou informações sobre saúde nesta demonstração.</p>
          <Link to="/ajuda" className="text-link">
            Precisa de ajuda? ↗
          </Link>
        </aside>
      </div>
      {selection && (
        <Notice kind="success" title="Horário selecionado para demonstração">
          Você escolheu {selection}. Nenhum agendamento foi realizado.
        </Notice>
      )}
    </section>
  )
}
