# Registro de implementação

## Supabase, autenticação e perfis — 23/10/2026

- Adicionado `@supabase/supabase-js`, cliente singleton tipado e variáveis públicas opcionais. Sem URL e publishable key, cadastro e login ficam desabilitados.
- Implementados cadastro de paciente, login, logout, recuperação/atualização de senha, estado de sessão, perfil básico editável e formulário do perfil profissional. A interface não coleta informações clínicas.
- As rotas `/paciente` e `/psicologo` agora exigem sessão e papel. As agendas exclusivamente fictícias foram separadas em `/demonstracao/paciente` e `/demonstracao/psicologo`.
- A migração cria `profiles`, `professional_profiles`, trigger com papel inicial invariavelmente `patient`, grants SQL por coluna, RLS, restrições básicas de conteúdo e view pública com campos limitados apenas para perfis verificados.
- Criada Edge Function administrativa que valida bearer token e papel no banco antes de usar uma chave secreta no backend para conceder papel profissional e status de verificação. A chave não está presente no frontend, arquivo de ambiente versionado nem logs implementados.
- Criados testes unitários de signup sem papel, login, logout, recuperação, atualização de senha e autorização de rota; criado arquivo pgTAP com casos planejados para RLS, grants, leitura/escrita entre usuários, papéis e verificação profissional.
- A integração não foi conectada a um projeto Supabase real. O CLI não está instalado e o daemon Docker está indisponível nesta sessão; portanto, a migração/pgTAP e a Edge Function ainda não foram executadas contra Postgres/Supabase. Os testes pgTAP estão escritos mas não aprovados.

### Verificações desta etapa

- `pnpm build`: passou; inclui `tsc -b` e compilação Vite de produção. O bundle JS principal ficou em aproximadamente 530 kB e gerou o alerta padrão do Vite para chunks maiores que 500 kB.
- `pnpm lint`: passou sem erros ou avisos.
- `pnpm test`: 4 arquivos e 14 testes unitários passaram (autenticação e estados de acesso incluídos).
- `pnpm format:check`: passou.
- Não executados: `supabase test db`, publicação da função, testes de navegador em Supabase configurado e validação de RLS em ambiente remoto; faltam CLI/Docker em execução e credenciais/configuração do projeto.

## Interface responsiva — 23/10/2026

- Mantida a fundação Vite/React/TypeScript e o sistema visual original; criados menu mobile, rodapé navegável e componentes compartilhados de formulário, filtros, calendário, avisos, estados e status.
- Implementadas as rotas para início, busca filtrável, perfil fictício, seleção local de data/horário, páginas informativas de acesso/cadastro, áreas demonstrativas de paciente e psicólogo, acessibilidade, ajuda e rascunho de privacidade.
- Dados de profissionais, disponibilidade, agendas, status e recursos são fictícios. Não há credenciais, avaliações, pagamentos, backend, autenticação nem coleta de informações clínicas.
- Tipografia usa fontes locais do sistema; a interface não faz chamadas a um serviço externo de fontes.
- Incluídos testes unitários da filtragem de profissionais; os testes end-to-end continuam pendentes.

## Fundação inicial — 23/10/2026

- Criada aplicação Vite com React e TypeScript estrito em repositório sem arquivos de aplicação.
- Adicionados React Router, ESLint, Prettier e Vitest com scripts de desenvolvimento, build, lint, formatação, tipos e testes.
- Organizadas as pastas iniciais por aplicação, providers, componentes, acessibilidade e funcionalidades; criadas também as áreas reservadas `supabase/` e `tests/e2e/`.
- Incluída página inicial responsiva com profissionais fictícios e valor demonstrativo de R$ 50 por sessão.
- Incluído controle de acessibilidade para contraste reforçado, texto maior e redução de movimento.
- Documentados setup, limites da demonstração e regras para segredos no README e em `.env.example`.

## Verificações da fundação e interface

- `pnpm install --offline`: concluído; script de instalação do `esbuild` permitido de forma explícita.
- TypeScript `tsc -b --pretty`: passou, sem erros.
- ESLint: passou, sem erros ou avisos.
- Vitest: 4 testes unitários passaram em 2 arquivos (formatação e filtros locais); o runner exibiu aviso de encerramento demorado após a conclusão.
- Prettier `--check .`: passou.
- Vite `build`: passou; bundle de produção gerado em `dist/`.
- O servidor Vite iniciou localmente. A verificação HTTP e a validação visual em navegador não foram concluídas neste ambiente.

## Pendências

- Integração real de identidade, persistência e backend.
- Fluxo real de agendamento e disponibilidade.
- Serviço de videochamada e legendas.
- Fluxo de pagamento, explicitamente fora do escopo desta fundação.
- Estratégia de testes end-to-end e validação automatizada dos breakpoints em navegador.
- Investigar o aviso de encerramento do Vitest no ambiente local.
