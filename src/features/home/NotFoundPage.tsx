import { Link } from 'react-router-dom'
import { StateMessage } from '../../components/ui/StateMessage'

export function NotFoundPage() {
  return (
    <section className="section inner-page">
      <span className="eyebrow">Página não encontrada</span>
      <h1>
        Este caminho
        <br />
        <em>não está por aqui.</em>
      </h1>
      <StateMessage kind="error" title="Endereço indisponível">
        Confira o link ou retorne à página inicial.
      </StateMessage>
      <Link className="button-link" to="/">
        Voltar ao início <span aria-hidden="true">↗</span>
      </Link>
    </section>
  )
}
