# Autenticação e perfis

`authService.ts` centraliza cadastro, login, logout, recuperação e leitura/escrita de perfis. `AuthProvider` sincroniza a sessão Supabase e `ProtectedRoute` controla a navegação por papel como UX. Banco e backend impõem a autorização real. Novos usuários recebem papel paciente no trigger SQL; metadados do navegador não podem atribuir papéis privilegiados.

O serviço fica inativo sem `VITE_SUPABASE_URL` e `VITE_SUPABASE_PUBLISHABLE_KEY`. Nunca adicionar chaves secretas a esta aplicação cliente.
