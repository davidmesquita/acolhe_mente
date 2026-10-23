import { NavLink } from 'react-router-dom'

export function AppointmentsPage() {
  return (
    <section className="section inner-page">
      <span className="eyebrow">Um primeiro passo, sem pressa</span>
      <h1>
        Vamos encontrar
        <br />
        <em>um horário?</em>
      </h1>
      <p className="page-intro">
        O agendamento online ainda não está conectado. Esta versão de demonstração não solicita nem
        armazena informações pessoais.
      </p>
      <div className="info-panel">
        <span className="panel-icon" aria-hidden="true">
          ✳
        </span>
        <div>
          <h2>Como será o próximo passo</h2>
          <p>
            Em uma versão futura, você poderá escolher um profissional e consultar horários
            disponíveis. Sessões demonstrativas: R$ 50.
          </p>
          <NavLink className="text-link" to="/profissionais">
            Conhecer os perfis fictícios <span aria-hidden="true">↗</span>
          </NavLink>
        </div>
      </div>
    </section>
  )
}
