# Migrações

`20261023000000_profiles_and_rls.sql` cria perfis básicos, perfil profissional, trigger de cadastro seguro (papel inicial sempre paciente), grants mínimos, RLS e view pública restrita a profissionais verificados. Aplica-se com `supabase db push` ou `supabase db reset` em projeto local.

Não modifica autenticação já existente além do trigger `auth.users` e não cria dados, contas privilegiadas, consultas, prontuários ou transcrições. Mudanças futuras devem ser uma nova migração numerada; não edite migrações já aplicadas em ambientes compartilhados.
