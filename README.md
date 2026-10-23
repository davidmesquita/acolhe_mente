# AcolheMente

Portal demonstrativo de psicologia social para explorar profissionais fictícios e visualizar um fluxo de agendamento. A interface não realiza pagamentos, atendimento clínico, chamadas de vídeo, autenticação ou coleta de dados pessoais.

## Requisitos

- Node.js 20.19+ ou 22.12+ (compatível com Vite 7)
- npm 10+ ou pnpm 9+

## Instalação e execução

```sh
npm install
cp .env.example .env
npm run dev
```

No PowerShell, use `Copy-Item .env.example .env` no lugar do comando `cp`. A aplicação estará disponível no endereço informado pelo Vite, normalmente `http://localhost:5173`.

## Verificações

```sh
npm run typecheck
npm run lint
npm test
npm run build
```

## Estrutura

- `src/app`: configuração da aplicação e rotas.
- `src/components`: componentes compartilhados, UI, layout e acessibilidade.
- `src/features`: áreas de profissionais, agendamentos, sessão online e legendas.
- `src/lib`, `src/hooks`, `src/types`, `src/styles`: utilitários, hooks, tipos e estilos.
- `supabase`: espaço reservado para evolução futura; não há conexão nem credenciais configuradas.
- `tests`: testes unitários e espaço reservado para testes e2e.

## Páginas disponíveis

- Início (`/`): apresentação do serviço, preço social demonstrativo de R$ 50 e acesso à busca.
- Busca (`/profissionais`): filtros locais por especialidade, horário, atendimento online, acessibilidade e comunicação.
- Perfil (`/profissionais/:id`): detalhes de um perfil explicitamente fictício.
- Seleção de horário (`/agendar/:id`): calendário local de demonstração; a escolha não cria uma reserva.
- Entrar e cadastro (`/entrar`, `/cadastro`): páginas informativas; não aceitam senha nem autenticam usuários.
- Área do paciente (`/paciente`) e área profissional (`/psicologo`): agendas compostas apenas por dados inventados.
- Acessibilidade (`/acessibilidade`), ajuda (`/ajuda`) e termos/privacidade (`/privacidade`). O conteúdo de termos e privacidade está identificado como rascunho sujeito a revisão profissional.

Todas as agendas, disponibilidade, recursos e perfis são fictícios. Não há serviço de contato, backend, pagamento ou atendimento conectado.

Os dados de profissionais e horários são fictícios e ficam no código para demonstração. Não envie informações de saúde, dados sensíveis ou credenciais ao frontend. A variável `VITE_*` é pública por definição.

## Decisões e pendências

Consulte [IMPLEMENTATION.md](./IMPLEMENTATION.md) para o registro das alterações, verificações executadas e funcionalidades que seguem como pendência.
