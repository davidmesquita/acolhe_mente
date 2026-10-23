import { NavLink } from 'react-router-dom'
import { ProfessionalCard } from '../../components/ui/ProfessionalCard'
import { professionals } from '../professionals/data'

const steps = [
  {
    number: '01',
    title: 'Encontre seu espaço',
    text: 'Conheça profissionais e escolha quem faz sentido para você.',
  },
  {
    number: '02',
    title: 'Escolha um horário',
    text: 'Veja as opções disponíveis e solicite seu agendamento.',
  },
  {
    number: '03',
    title: 'Converse com calma',
    text: 'Sua sessão online acontece em um ambiente acolhedor.',
  },
]

export function HomePage() {
  return (
    <>
      <section className="hero">
        <div className="hero-inner">
          <div className="hero-copy">
            <div className="hero-kicker">
              <span className="sparkle">✳</span> Plataforma em demonstração
            </div>
            <h1>
              Você merece um lugar para <em>se escutar.</em>
            </h1>
            <p className="hero-description">
              Encontre apoio psicológico acolhedor, online e acessível. Um passo de cada vez, no seu
              ritmo.
            </p>
            <div className="hero-actions">
              <NavLink className="button-link button-primary" to="/agendar">
                Encontrar meu espaço <span aria-hidden="true">↗</span>
              </NavLink>
              <span className="hero-price">
                <strong>Valor social</strong> informado antes da solicitação
              </span>
            </div>
            <div className="hero-note">
              <span className="small-sparkle">✳</span> Acolhimento sem julgamento. Do jeito que você
              precisa.
            </div>
          </div>
          <div className="hero-art" aria-hidden="true">
            <div className="art-sun"></div>
            <div className="art-orbit orbit-one"></div>
            <div className="art-orbit orbit-two"></div>
            <div className="art-leaf leaf-one">⌒</div>
            <div className="art-leaf leaf-two">⌒</div>
            <div className="art-card art-card-top">
              <span className="art-dot">✳</span>
              <span>
                Seu tempo.
                <br />
                Seu caminho.
              </span>
            </div>
            <div className="art-person">
              <div className="person-hair"></div>
              <div className="person-face"></div>
              <div className="person-body"></div>
            </div>
            <div className="art-card art-card-bottom">
              <span className="mini-heart">♡</span>
              <span>
                Um espaço
                <br />
                só seu
              </span>
            </div>
          </div>
          <div className="hero-stamp" aria-hidden="true">
            <span>cuidar de si</span>
            <b>é começo</b>
            <i>✳</i>
          </div>
        </div>
      </section>

      <section className="trust-strip" aria-label="Benefícios">
        <div className="trust-inner">
          <span>
            <b>✳</b> Formato previsto: online
          </span>
          <span>
            <b>♡</b> Acolhimento para todos
          </span>
          <span>
            <b>◎</b> Valor configurado e exibido na agenda
          </span>
        </div>
      </section>

      <section className="section professionals-section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">Pessoas que acolhem</span>
            <h2>
              Um encontro pode
              <br />
              <em>mudar o caminho.</em>
            </h2>
          </div>
          <NavLink className="text-link" to="/profissionais">
            Ver todos os profissionais <span aria-hidden="true">↗</span>
          </NavLink>
        </div>
        <div className="professional-grid">
          {professionals.slice(0, 3).map((person) => (
            <ProfessionalCard key={person.id} professional={person} />
          ))}
        </div>
        <p className="demo-disclaimer">
          Profissionais apresentados para demonstração; perfis fictícios.
        </p>
      </section>

      <section className="steps-section">
        <div className="section steps-inner">
          <div className="steps-heading">
            <span className="eyebrow">Simples assim</span>
            <h2>
              Começar pode
              <br />
              <em>ser leve.</em>
            </h2>
            <p>Você não precisa ter tudo resolvido para dar o primeiro passo.</p>
          </div>
          <div className="steps-list">
            {steps.map((step) => (
              <article className="step" key={step.number}>
                <span className="step-number">{step.number}</span>
                <div>
                  <h3>{step.title}</h3>
                  <p>{step.text}</p>
                </div>
                <span className="step-arrow" aria-hidden="true">
                  ↗
                </span>
              </article>
            ))}
          </div>
        </div>
      </section>
      <section className="closing-cta">
        <span className="eyebrow">Seu primeiro passo</span>
        <h2>
          Que tal começar
          <br />
          <em>por você?</em>
        </h2>
        <NavLink className="button-link button-primary" to="/agendar">
          Ver como funciona <span aria-hidden="true">↗</span>
        </NavLink>
      </section>
    </>
  )
}
