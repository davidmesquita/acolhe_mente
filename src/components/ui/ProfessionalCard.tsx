import type { Professional } from '../../types/professional'
import { ButtonLink } from './ButtonLink'

export function ProfessionalCard({ professional }: { professional: Professional }) {
  return (
    <article className="professional-card">
      <div className={`portrait portrait-${professional.color}`} aria-hidden="true">
        <span>{professional.initials}</span>
      </div>
      <div className="professional-info">
        <span className="eyebrow">{professional.focus}</span>
        <h3>{professional.name}</h3>
        <p>{professional.description}</p>
        <div className="card-bottom">
          <span className="price">
            R$ 50 <small>/ sessão</small>
          </span>
          <ButtonLink to="/agendar" aria-label={`Agendar sessão com ${professional.name}`}>
            Conhecer <span aria-hidden="true">↗</span>
          </ButtonLink>
        </div>
      </div>
    </article>
  )
}
