# Registro de implementação

## Fundação inicial — 23/10/2026

- Criada aplicação Vite com React e TypeScript estrito em repositório sem arquivos de aplicação.
- Adicionados React Router, ESLint, Prettier e Vitest com scripts de desenvolvimento, build, lint, formatação, tipos e testes.
- Organizadas as pastas iniciais por aplicação, providers, componentes, acessibilidade e funcionalidades; criadas também as áreas reservadas `supabase/` e `tests/e2e/`.
- Incluída página inicial responsiva com profissionais fictícios e valor demonstrativo de R$ 50 por sessão.
- Incluído controle de acessibilidade para contraste reforçado, texto maior e redução de movimento.
- Documentados setup, limites da demonstração e regras para segredos no README e em `.env.example`.

## Verificações

- `pnpm install --offline`: concluído; script de instalação do `esbuild` permitido de forma explícita.
- `tsc -b --pretty`: passou, sem erros de TypeScript.
- ESLint: passou, sem erros ou avisos.
- Vitest: 1 teste unitário passou (formatação de R$ 50); o runner exibiu aviso de encerramento demorado do processo após os testes concluírem.
- Prettier `--check .`: passou.
- Vite `build`: passou; bundle de produção gerado em `dist/`.
- Vite dev server: iniciou em `http://127.0.0.1:5173/` e preview em `http://127.0.0.1:4173/`. A tentativa de confirmar as respostas HTTP foi bloqueada pelo ambiente de execução; os processos foram encerrados após a checagem.

## Pendências

- Integração real de identidade, persistência e backend.
- Fluxo real de agendamento e disponibilidade.
- Serviço de videochamada e legendas.
- Fluxo de pagamento, explicitamente fora do escopo desta fundação.
- Estratégia de testes end-to-end.
- Investigar o aviso de encerramento do Vitest no ambiente local.
