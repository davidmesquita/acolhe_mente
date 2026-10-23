import { Link, useParams } from 'react-router-dom'
import { Notice } from '../../components/ui/Notice'
import { professionals } from './data'

export function ProfessionalProfilePage() {
  const { professionalId } = useParams()
  const person = professionals.find((candidate) => candidate.id === professionalId)
  if (!person)
    return (
      <section className="section inner-page">
        <span className="eyebrow">Perfil não encontrado</span>
        <h1>
          Vamos tentar
          <br />
          <em>outra busca?</em>
        </h1>
        <Link className="text-link" to="/profissionais">
          Voltar à busca de profissionais ↗
        </Link>
      </section>
    )

  return (
    <section className="section inner-page profile-page">
      <div className="profile-heading">
        <div
          className={`portrait portrait-${person.color}`}
          role="img"
          aria-label={`Ilustração abstrata de ${person.name}; perfil fictício`}
        >
          <span>{person.initials}</span>
        </div>
        <div>
          <span className="eyebrow">Perfil fictício · demonstração</span>
          <h1>{person.name}</h1>
          <p>{person.focus}</p>
        </div>
      </div>
      <Notice title="Informações ilustrativas">
        Este perfil não representa uma pessoa real. Não há credenciais, avaliações ou
        disponibilidade profissional verificadas.
      </Notice>
      <div className="profile-columns">
        <div>
          <h2>Um espaço de escuta</h2>
          <p>
            {person.description} Este texto é um exemplo de apresentação para demonstrar como um
            perfil poderá funcionar.
          </p>
          <h2>Como podemos conversar</h2>
          <ul className="tag-list">
            {person.communication.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        <aside className="profile-aside">
          <h2>Atendimento online</h2>
          <p>Recursos listados apenas como conteúdo fictício da demonstração.</p>
          <ul className="tag-list">
            {person.accessibility.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <p>Este perfil fictício não possui horários reserváveis.</p>
        </aside>
      </div>
      <Link className="text-link" to="/profissionais">
        ← Voltar para os resultados
      </Link>
    </section>
  )
}
