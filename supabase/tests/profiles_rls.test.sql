begin;
create extension if not exists pgtap with schema extensions;
select plan(22);

select has_table('public', 'profiles', 'profiles existe');
select has_table('public', 'professional_profiles', 'professional_profiles existe');
select ok((select relrowsecurity from pg_class where oid = 'public.profiles'::regclass), 'RLS ativo em profiles');
select ok((select relrowsecurity from pg_class where oid = 'public.professional_profiles'::regclass), 'RLS ativo em professional_profiles');
select ok(has_column_privilege('authenticated', 'public.profiles', 'display_name', 'UPDATE'), 'usuário pode atualizar nome próprio');
select ok(not has_column_privilege('authenticated', 'public.profiles', 'role', 'UPDATE'), 'usuário não pode atualizar papel');
select ok(not has_column_privilege('authenticated', 'public.professional_profiles', 'verification_status', 'UPDATE'), 'profissional não pode alterar verificação');
select ok(has_table_privilege('anon', 'public.verified_professional_profiles', 'SELECT'), 'anon pode ler apenas a view pública filtrada');
select ok(not has_table_privilege('anon', 'public.professional_profiles', 'SELECT'), 'anon não pode ler tabela profissional diretamente');

insert into auth.users (id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
values
  ('10000000-0000-4000-8000-000000000001', 'authenticated', 'authenticated', 'patient-a@example.test', '', now(), '{"provider":"email","providers":["email"]}', '{"display_name":"Paciente A"}', now(), now()),
  ('10000000-0000-4000-8000-000000000002', 'authenticated', 'authenticated', 'patient-b@example.test', '', now(), '{"provider":"email","providers":["email"]}', '{"display_name":"Paciente B"}', now(), now()),
  ('10000000-0000-4000-8000-000000000003', 'authenticated', 'authenticated', 'psych@example.test', '', now(), '{"provider":"email","providers":["email"]}', '{"display_name":"Profissional teste"}', now(), now()),
  ('10000000-0000-4000-8000-000000000004', 'authenticated', 'authenticated', 'admin@example.test', '', now(), '{"provider":"email","providers":["email"]}', '{"display_name":"Admin teste"}', now(), now());
update public.profiles set role = 'psychologist' where id = '10000000-0000-4000-8000-000000000003';
update public.profiles set role = 'admin' where id = '10000000-0000-4000-8000-000000000004';
insert into public.professional_profiles (id, presentation, verification_status)
values ('10000000-0000-4000-8000-000000000003', 'Ficha fictícia de teste', 'verified');

set local role authenticated;
select set_config('request.jwt.claim.sub', '10000000-0000-4000-8000-000000000001', true);
select is((select count(*)::integer from public.profiles), 1, 'paciente lê somente o próprio perfil');
select is((with changed as (update public.profiles set display_name = 'Novo nome' where id = '10000000-0000-4000-8000-000000000001' returning 1) select count(*)::integer from changed), 1, 'paciente atualiza o próprio nome');
select is((with changed as (update public.profiles set display_name = 'Acesso cruzado' where id = '10000000-0000-4000-8000-000000000002' returning 1) select count(*)::integer from changed), 0, 'paciente não atualiza perfil de outra pessoa');
select is((select count(*)::integer from public.professional_profiles), 1, 'paciente lê perfil profissional verificado');
select is((select count(*)::integer from public.verified_professional_profiles), 1, 'visão pública mostra o perfil verificado');
select throws_ok($$ update public.profiles set role = 'admin' where id = '10000000-0000-4000-8000-000000000001' $$, '42501', null, 'tentativa de elevação de papel é negada');
select throws_ok($$ update public.professional_profiles set verification_status = 'verified' where id = '10000000-0000-4000-8000-000000000001' $$, '42501', null, 'tentativa de alterar verificação é negada');
reset role;

set local role authenticated;
select set_config('request.jwt.claim.sub', '10000000-0000-4000-8000-000000000002', true);
select is((select count(*)::integer from public.profiles), 1, 'segundo paciente lê apenas o perfil próprio');
select is((select count(*)::integer from public.professional_profiles), 1, 'segundo paciente só vê profissionais verificados');
reset role;

set local role authenticated;
select set_config('request.jwt.claim.sub', '10000000-0000-4000-8000-000000000003', true);
select is((select count(*)::integer from public.professional_profiles), 1, 'profissional lê o próprio perfil profissional');
select throws_ok($$ update public.professional_profiles set verification_status = 'rejected' where id = '10000000-0000-4000-8000-000000000003' $$, '42501', null, 'profissional não altera sua verificação');
reset role;

set local role authenticated;
select set_config('request.jwt.claim.sub', '10000000-0000-4000-8000-000000000004', true);
select is((select count(*)::integer from public.profiles), 4, 'admin consulta perfis para moderação');
select is((select count(*)::integer from public.professional_profiles), 1, 'admin consulta perfis profissionais');
reset role;

select * from finish();
rollback;
