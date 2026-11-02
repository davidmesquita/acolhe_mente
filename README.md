# AcolheMente

Portal de psicologia social. Com Supabase configurado, pacientes solicitam horários de profissionais verificados e os profissionais administram atendimentos. A videochamada JaaS e as legendas locais são experimentais, disponíveis apenas para atendimentos fictícios explicitamente marcados. Não há prontuário, pagamento ou uso clínico.

### Rotas privadas de teste

`/sessao-online` exige uma sessão Supabase real e permite testar câmera/microfone localmente, sem participantes remotos. `/sessao-online/:appointmentId` aceita paciente ou psicólogo autenticado, mas a Edge Function também exige participação no agendamento, status confirmado, `is_demo=true` e janela de horário. Crie contas sintéticas em projeto Supabase local; não há usuário/senha fixos no repositório.

O loopback é somente um teste local de dispositivos. A rota por agendamento usa JaaS (8x8), recebe um JWT curto do backend e não grava links/tokens. JaaS processa a mídia para a chamada; gravação e transcrição do provedor são desativadas. As legendas solicitam reconhecimento local `pt-BR` após ação explícita, sem fallback em nuvem e sem persistência. Ambas as funções são para diálogos fictícios, não para atendimento ou dados clínicos.

## Requisitos

- Node.js 20.19+ ou 22.12+ (compatível com Vite 7)
- npm 10+

## Instalação e execução

```sh
npm ci
Copy-Item .env.example .env.local
npm run dev
```

No PowerShell, use `Copy-Item .env.example .env` no lugar do comando `cp`. A aplicação estará disponível no endereço informado pelo Vite, normalmente `http://localhost:5173`.

### Executar pelo WSL

Mantenha o repositório dentro do sistema de arquivos Linux (por exemplo, `~/projetos/AcolheMente`) para evitar lentidão em `/mnt/c`. No terminal da distribuição WSL, instale Node.js 20.19+ com npm, entre na pasta do projeto e execute:

```sh
npm ci
cp .env.example .env.local
npm run dev:wsl
```

Abra `http://localhost:5173` no navegador do Windows ou do WSL. O script `dev:wsl` vincula o Vite a todas as interfaces da distribuição e fixa a porta 5173; use-o somente durante o desenvolvimento. O Supabase Auth está configurado com `http://localhost:5173` como Site URL e permite os redirecionamentos locais `http://localhost:5173/**` e `http://127.0.0.1:5173/**`.

## Verificações

```sh
npm run typecheck
npm run lint
npm test
npm run build
```

## Configuração do Supabase

1. Crie um projeto Supabase e aplique as migrações versionadas: `supabase db push` (remoto) ou `supabase start` seguido de `supabase db reset` (local, com Docker).
2. Copie a URL do projeto e a chave **publishable** para `.env.local`, usando `.env.example` como modelo. Essas variáveis `VITE_*` são públicas e ficam no bundle do navegador; a chave publishable não substitui RLS.
3. No Supabase Auth → URL Configuration, configure a Site URL e os Redirect URLs. Para desenvolvimento local, a configuração aplicada é Site URL `http://localhost:5173` e os Redirect URLs `http://localhost:5173/**` e `http://127.0.0.1:5173/**`, necessários para confirmação de cadastro e recuperação em `/recuperar-senha`. Antes de publicar, substitua a Site URL pelo domínio HTTPS de produção e adicione somente os redirecionamentos desse domínio; mantenha os endereços locais apenas se ainda precisar desenvolver localmente.
4. Para testes SQL locais, instale o Supabase CLI, inicie Docker e execute `supabase test db`. Os casos pgTAP ficam em `supabase/tests/`.
5. Publique a função administrativa após revisar sua política de origem: `supabase functions deploy admin-professional-management`. Configure `APP_ALLOWED_ORIGIN`, `APP_SUPABASE_PUBLISHABLE_KEY` e `APP_SUPABASE_SECRET_KEY` como secrets da função (Dashboard ou `supabase secrets set`). Use sempre `APP_SUPABASE_SECRET_KEY` apenas no ambiente da função. Nunca o coloque em `.env.local`, variável `VITE_*`, Git, log ou navegador.
6. A sala JaaS é opcional e desativada por padrão. Publique `supabase functions deploy meeting-room-token` e defina no ambiente da função `APP_ALLOWED_ORIGIN`, `APP_SUPABASE_PUBLISHABLE_KEY`, `APP_SUPABASE_SECRET_KEY`, `JAAS_APP_ID`, `JAAS_API_KEY_ID` e `JAAS_PRIVATE_KEY` (PEM PKCS#8). Defina `DEMO_SESSIONS_ENABLED=true` somente no projeto de teste e depois de revisar [a avaliação de videochamada](src/features/video-session/README.md). Não use segredos JaaS no cliente.

O primeiro administrador deve ser designado manualmente por operador autorizado no SQL Editor do projeto, após verificar a identidade da conta: `update public.profiles set role = 'admin' where id = '<UUID verificado>';`. Não há conta, senha fixa ou seed administrativo. A função server-side valida o bearer token e consulta o papel no banco antes de usar a chave privilegiada.

Sem as duas variáveis públicas configuradas, a interface deixa autenticação desabilitada e informa a pendência. Não digite credenciais até conectar o projeto correto.

## Estrutura

- `src/app`: configuração da aplicação e rotas.
- `src/components`: componentes compartilhados, UI, layout e acessibilidade.
- `src/features`: áreas de profissionais, agendamentos, sessão online e legendas.
- `src/lib`, `src/hooks`, `src/types`, `src/styles`: utilitários, hooks, tipos e estilos.
- `supabase/migrations`: schema de perfis e agenda, políticas RLS, privilégios mínimos e views públicas restritas a profissionais verificados.
- `supabase/functions`: operações administrativas e emissão server-side do JWT JaaS após validação do participante.
- `supabase/tests`: casos pgTAP para papéis, agenda, isolamento e sessões demo; precisam de Supabase local para executar.
- `tests/unit`: testes de autenticação, fusos, legendas e janela de sessão; `tests/e2e`: roteiro manual de navegador.

## Páginas disponíveis

- Início (`/`): apresentação do serviço e acesso à busca e à agenda.
- Busca (`/profissionais`): profissionais verificados do banco e perfis fictícios separados, sem misturar demonstrações com agendas reais.
- Perfil (`/profissionais/:id`): detalhes de um perfil explicitamente fictício.
- Seleção de horário (`/agendar/:id`): disponibilidade calculada no banco, confirmação autenticada e idempotente; novas solicitações começam pendentes.
- Entrar, cadastro, recuperação (`/entrar`, `/cadastro`, `/esqueci-senha`, `/recuperar-senha`): Supabase Auth quando configurado. Novos cadastros começam como paciente; confirmação de e-mail depende da configuração Auth.
- Área do paciente (`/paciente`) e área profissional (`/psicologo`): protegidas por sessão e papel; exibem agendamentos próprios. Pacientes podem cancelar ou reagendar; psicólogos confirmam, concluem ou cancelam e configuram disponibilidade/bloqueios.
- Demonstrações isoladas (`/demonstracao/paciente`, `/demonstracao/psicologo`): agendas fictícias sem vínculo com contas.
- Sessão local (`/sessao-online`): loopback de câmera/microfone, sem conexão remota.
- Sala de demonstração (`/sessao-online/:appointmentId`): JaaS para participantes autenticados de agendamento fictício confirmado; requer Edge Function e secrets.
- Acessibilidade (`/acessibilidade`), ajuda (`/ajuda`) e termos/privacidade (`/privacidade`). O conteúdo de termos e privacidade está identificado como rascunho sujeito a revisão profissional.

### Regras da agenda

- `scheduler_settings` define o preço inicial (5000 centavos), duração inicial (50 minutos) e janela de cancelamento (24 horas). O navegador não envia preço, duração ou status final. Alterações são operacionais no banco, restritas a `service_role`; ainda não existe tela administrativa.
- Cada profissional configura uma faixa semanal por dia e um fuso IANA. Bloqueios pontuais são intervalos UTC derivados do horário local informado.
- Agendamentos e bloqueios usam `timestamptz`. O calendário converte as datas do profissional; pacientes veem o horário no fuso do dispositivo.
- A reserva é uma RPC transacional. Uma trava consultiva serializa alterações por profissional; uma restrição GiST de exclusão rejeita qualquer sobreposição de intervalos ativos, inclusive reservas concorrentes. A chave de idempotência evita duplicar uma solicitação repetida.
- Estados: `requested`, `confirmed`, `cancelled` e `completed`. Somente o profissional confirma; conclusão só é permitida após o horário final. Pacientes cancelam até o limite configurado. Reagendamento cancela e cria a nova reserva na mesma transação.
- RLS impede leitura de agendamentos por terceiros, e o cliente não recebe links de videochamada nem pode inserir diretamente uma reserva.

### Sala e legendas experimentais

- `is_demo` é `false` por padrão. Somente o servidor emite JWT JaaS restrito ao agendamento e sala, depois de conferir usuário, papel, status e janela de 15 minutos antes/depois. Um UUID ou nome de sala não é a autorização.
- O JaaS Dev tinha cota publicada de 25 MAUs grátis no acesso de 23/10/2026; planos pagos e add-ons podem gerar cobrança. `meet.jit.si` público não é usado para agendamentos porque o projeto não controla de forma confiável quem cria/entra em salas públicas.
- A API Web Speech é limitada por navegador. O código só ativa o modo local experimental com pacote `pt-BR`; quando ausente, legendas ficam indisponíveis. Não há serviço externo de reconhecimento conectado.
- Transcrição é memória temporária da página, iniciada por clique e apagada ao sair/limpar. Não é perfeita nem substitui intérprete de Libras. Somente diálogos sintéticos são permitidos nesta etapa.
- Fontes e comparativo de preços, suporte, privacidade e alternativas estão em [video-session/README.md](src/features/video-session/README.md) e [captions/README.md](src/features/captions/README.md).

### Testes da agenda

- Unitários: `npm test`, incluindo conversão UTC/local perto da virada do dia e horário local inexistente na mudança de DST.
- Banco: `supabase test db`, incluindo reserva válida, repetição idempotente, slot ocupado/bloqueado, sobreposição parcial, cancelamento, bloqueio de atendimento ativo e isolamento entre usuários.
- Sessão: `supabase test db` inclui `video_demo_sessions.test.sql`; roteiro manual de câmeras, reconexão, encerramento, mobile, reconhecimento indisponível e não persistência está em `tests/e2e/README.md`.
- Concorrência real: o teste `tests/integration/schedulingConcurrency.test.ts` cria contas sintéticas e dispara duas RPCs ao mesmo instante; ele só executa quando `SUPABASE_TEST_URL` (localhost), `SUPABASE_TEST_PUBLISHABLE_KEY` e `SUPABASE_TEST_SECRET_KEY` estão definidos no ambiente. Contas e reservas são removidas no fim.
- A trava por profissional e constraint GiST garantem serialização no banco. Migrações, pgTAP, testes do navegador/JaaS e reconhecimento local ainda não foram executados nesta sessão: faltam Node/npm, Supabase CLI, Docker, conta e credenciais JaaS. Rode testes fictícios em Supabase local antes de habilitar o provedor.

Os dados de demonstração ficam no código. Não envie informações de saúde, dados sensíveis ou credenciais para campos ou logs. A variável `VITE_*` é pública por definição. O navegador recebe somente URL e chave publishable. Chaves secret/service-role devem existir exclusivamente em secrets do backend/Edge Function.

## Limites de segurança

O desenho combina RLS com grants SQL mínimos, políticas de coluna, views públicas restritas, constraints PostgreSQL e checagem server-side nas Edge Functions. Isso não é certificação de segurança, privacidade ou conformidade clínica. As políticas e o fluxo de participante/JaaS precisam ser testados no projeto destino; segredos e backups cabem à operação. Não há histórico clínico, prontuário, gravação ou uso com pacientes.

## Decisões e pendências

Consulte [IMPLEMENTATION.md](./IMPLEMENTATION.md) para o registro das alterações, verificações executadas e funcionalidades que seguem como pendência.
