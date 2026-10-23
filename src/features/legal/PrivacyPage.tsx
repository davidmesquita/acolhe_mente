export function PrivacyPage() {
  return (
    <section className="section inner-page content-page legal-page">
      <span className="eyebrow">Transparência em primeiro lugar</span>
      <h1>
        Termos e<br />
        <em>privacidade.</em>
      </h1>
      <div className="draft-banner">
        <strong>RASCUNHO — sujeito a revisão profissional</strong>
        <span>Este conteúdo não é uma política jurídica vigente.</span>
      </div>
      <p className="page-intro">
        Texto provisório. A política definitiva deve ser revista antes da operação pública do portal.
      </p>
      <article>
        <h2>1. Sobre esta demonstração</h2>
        <p>
          O portal permite solicitar e administrar horários quando conectado ao Supabase. A
          plataforma ainda não realiza pagamentos nem oferece chamadas de vídeo.
        </p>
        <h2>2. Dados pessoais</h2>
        <p>
          Com Supabase configurado, a autenticação, o perfil básico e os metadados do agendamento
          são persistidos. Horários são armazenados em UTC e exibidos no fuso local. Não envie
          informações clínicas pelo portal; não há prontuário ou campo clínico.
        </p>
        <h2>3. Conteúdo fictício</h2>
        <p>
          Perfis identificados como demonstração são fictícios e não podem ser reservados. A agenda
          de profissionais verificados conectada ao banco corresponde a disponibilidade real.
        </p>
        <h2>4. Próximas etapas</h2>
        <p>
          A política definitiva deverá detalhar tratamento, retenção, direitos dos titulares e
          canais de contato, com revisão profissional antes da operação pública.
        </p>
        <p className="draft-note">
          Rascunho de interface. Não substitui aconselhamento jurídico nem uma política de
          privacidade válida.
        </p>
      </article>
    </section>
  )
}
