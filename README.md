# AcolheMente

Portal inicial de psicologia social para apresentar profissionais e orientar o agendamento de sessões online. A interface é uma demonstração: não realiza pagamentos, atendimento clínico, chamadas de vídeo nem coleta dados pessoais.

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

Os dados de profissionais e horários são fictícios e ficam no código para demonstração. Não envie informações de saúde, dados sensíveis ou credenciais ao frontend. A variável `VITE_*` é pública por definição.

## Decisões e pendências

Consulte [IMPLEMENTATION.md](./IMPLEMENTATION.md) para o registro das alterações, verificações executadas e funcionalidades que seguem como pendência.
