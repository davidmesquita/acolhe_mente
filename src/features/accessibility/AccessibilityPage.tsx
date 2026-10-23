import { AccessibilityToolbar } from '../../components/accessibility/AccessibilityToolbar'

export function AccessibilityPage() {
  return (
    <section className="section inner-page content-page">
      <span className="eyebrow">Acolhimento também é acesso</span>
      <h1>
        Um portal para
        <br />
        <em>mais pessoas.</em>
      </h1>
      <p className="page-intro">
        Reunimos recursos para você ajustar a leitura e orientações para entender as opções de
        comunicação mostradas nos perfis fictícios.
      </p>
      <div className="accessibility-demo">
        <h2>Experimente as preferências</h2>
        <p>
          As opções abaixo mudam a apresentação desta demonstração. Você pode desativá-las a
          qualquer momento.
        </p>
        <AccessibilityToolbar />
      </div>
      <div className="content-columns">
        <article>
          <h2>Navegação e leitura</h2>
          <ul>
            <li>Use a tecla Tab para avançar entre links, campos e botões.</li>
            <li>O link “Pular para o conteúdo” aparece quando recebe foco pelo teclado.</li>
            <li>Amplie a página pelo navegador; o conteúdo se reorganiza em telas menores.</li>
            <li>As animações respeitam a preferência de movimento reduzido selecionada acima.</li>
          </ul>
        </article>
        <article>
          <h2>Comunicação e recursos</h2>
          <p>
            Filtros de legendas, Libras, leitura labial e comunicação por texto são dados de
            demonstração. A disponibilidade real desses recursos deverá ser confirmada diretamente
            com cada profissional quando houver uma plataforma conectada.
          </p>
        </article>
      </div>
      <p className="draft-note">
        Os recursos estão em desenvolvimento e ainda precisam de testes com pessoas com deficiência
        e revisão especializada.
      </p>
    </section>
  )
}
