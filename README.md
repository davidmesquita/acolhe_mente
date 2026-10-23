# AcolheMente

Portal de psicologia social. A busca e os horários de demonstração continuam locais e fictícios. Com um projeto Supabase configurado, o portal autentica usuários e persiste somente perfil básico de paciente e perfil profissional. Não existe prontuário, histórico clínico, pagamento ou videochamada conectados.

## Requisitos

- Node.js 20.19+ ou 22.12+ (compatível com Vite 7)
- npm 10+ ou pnpm 9+

## Instalação e execução

```sh
pnpm install
Copy-Item .env.example .env.local
pnpm dev
```

No PowerShell, use `Copy-Item .env.example .env` no lugar do comando `cp`. A aplicação estará disponível no endereço informado pelo Vite, normalmente `http://localhost:5173`.

## Verificações

```sh
pnpm typecheck
pnpm lint
pnpm test
pnpm build
```

## Configuração do Supabase

1. Crie um projeto Supabase e aplique as migrações versionadas: `supabase db push` (remoto) ou `supabase start` seguido de `supabase db reset` (local, com Docker).
2. Copie a URL do projeto e a chave **publishable** para `.env.local`, usando `.env.example` como modelo. Essas variáveis `VITE_*` são públicas e ficam no bundle do navegador; a chave publishable não substitui RLS.
3. No Supabase Auth, configure URLs de site e redirecionamento para o domínio local e de produção, incluindo `/recuperar-senha`.
4. Para testes SQL locais, instale o Supabase CLI, inicie Docker e execute `supabase test db`. Os casos pgTAP ficam em `supabase/tests/`.
5. Publique a função administrativa após revisar sua política de origem: `supabase functions deploy admin-professional-management`. Configure `APP_ALLOWED_ORIGIN`, `APP_SUPABASE_PUBLISHABLE_KEY` e `APP_SUPABASE_SECRET_KEY` como secrets da função (Dashboard ou `supabase secrets set`). Use sempre `APP_SUPABASE_SECRET_KEY` apenas no ambiente da função. Nunca o coloque em `.env.local`, variável `VITE_*`, Git, log ou navegador.

O primeiro administrador deve ser designado manualmente por operador autorizado no SQL Editor do projeto, após verificar a identidade da conta: `update public.profiles set role = 'admin' where id = '<UUID verificado>';`. Não há conta, senha fixa ou seed administrativo. A função server-side valida o bearer token e consulta o papel no banco antes de usar a chave privilegiada.

Sem as duas variáveis públicas configuradas, a interface deixa autenticação desabilitada e informa a pendência. Não digite credenciais até conectar o projeto correto.

## Estrutura

- `src/app`: configuração da aplicação e rotas.
- `src/components`: componentes compartilhados, UI, layout e acessibilidade.
- `src/features`: áreas de profissionais, agendamentos, sessão online e legendas.
- `src/lib`, `src/hooks`, `src/types`, `src/styles`: utilitários, hooks, tipos e estilos.
- `supabase/migrations`: schema de perfis, políticas RLS, privilégios por coluna e view pública somente de perfis verificados.
- `supabase/functions`: operações de concessão de função profissional e verificação, isoladas no backend.
- `supabase/tests`: casos pgTAP para papéis, grants, isolamento e RLS; precisam de Supabase local para executar.
- `tests/unit`: testes de serviços de autenticação e autorização de rotas; `tests/e2e`: plano de testes de navegador ainda pendente.

## Páginas disponíveis

- Início (`/`): apresentação do serviço, preço social demonstrativo de R$ 50 e acesso à busca.
- Busca (`/profissionais`): filtros locais por especialidade, horário, atendimento online, acessibilidade e comunicação.
- Perfil (`/profissionais/:id`): detalhes de um perfil explicitamente fictício.
- Seleção de horário (`/agendar/:id`): calendário local de demonstração; a escolha não cria uma reserva.
- Entrar, cadastro, recuperação (`/entrar`, `/cadastro`, `/esqueci-senha`, `/recuperar-senha`): Supabase Auth quando configurado. Novos cadastros começam como paciente; confirmação de e-mail depende da configuração Auth.
- Área do paciente (`/paciente`) e área profissional (`/psicologo`): protegidas por sessão e papel carregado do banco; exibem e atualizam somente perfil básico. Não há consultas reais persistidas.
- Demonstrações isoladas (`/demonstracao/paciente`, `/demonstracao/psicologo`): agendas fictícias sem vínculo com contas.
- Acessibilidade (`/acessibilidade`), ajuda (`/ajuda`) e termos/privacidade (`/privacidade`). O conteúdo de termos e privacidade está identificado como rascunho sujeito a revisão profissional.

Busca, agendas, disponibilidade e reserva permanecem fictícias e locais. Perfis verificados reais só poderão ser lidos pela view pública aprovada; o frontend atual não mistura esses dados com demonstrações.

Os dados de demonstração ficam no código. Não envie informações de saúde, dados sensíveis ou credenciais para campos ou logs. A variável `VITE_*` é pública por definição. O navegador recebe somente URL e chave publishable. Chaves secret/service-role devem existir exclusivamente em secrets do backend/Edge Function.

## Limites de segurança

O desenho combina RLS com grants SQL mínimos, políticas de coluna, view pública de campos fixos, validação de constraints no PostgreSQL e checagem server-side na Edge Function. Isso não é uma certificação de segurança: as políticas precisam ser exercitadas no projeto de destino, a administração de chaves e backups cabe à operação e a implantação requer revisão profissional. A função administrativa está preparada para execução, mas não foi publicada nem testada contra um projeto remoto nesta sessão. Não há histórico clínico, prontuário, transcrição ou tabelas de agendamento.

## Decisões e pendências

Consulte [IMPLEMENTATION.md](./IMPLEMENTATION.md) para o registro das alterações, verificações executadas e funcionalidades que seguem como pendência.
