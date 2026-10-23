# Migrações

`20261023000000_profiles_and_rls.sql` cria perfis básicos, perfil profissional, trigger de cadastro seguro (papel inicial sempre paciente), grants mínimos, RLS e view pública restrita a profissionais verificados.

`20261023120000_scheduling.sql` cria as configurações do sistema, disponibilidade semanal, exceções, agendamentos e status explícitos. A reserva, cancelamento, reagendamento, mudanças de status e edição da disponibilidade usam funções transacionais com `search_path` fixo. Grants e RLS protegem linhas e operações; uma constraint GiST impede sobreposição de intervalos `requested`/`confirmed`, inclusive em concorrência.

Preço, duração e janela de cancelamento ficam em `scheduler_settings` (defaults: 5000 centavos, 50 minutos e 24 horas). Apenas operador de banco/`service_role` pode modificar essas configurações; não existe tela de administração ainda. Disponibilidade usa fuso IANA local e instantes de reserva/bloqueio são persistidos como `timestamptz`.

Aplicar com `supabase db push` ou `supabase db reset` em projeto local. Executar os testes com `supabase test db`; `scheduling.test.sql` usa somente contas sintéticas em transação revertida.

Não cria contas permanentes, prontuários, pagamentos, links de vídeo ou transcrições. Mudanças futuras devem ser uma nova migração numerada; não edite migrações já aplicadas em ambientes compartilhados.
