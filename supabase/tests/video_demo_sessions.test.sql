begin;
create extension if not exists pgtap with schema extensions;
select no_plan();

select has_column('public', 'appointments', 'is_demo', 'agendamentos têm marcador fictício explícito');
select is(
  (select column_default from information_schema.columns
    where table_schema = 'public' and table_name = 'appointments' and column_name = 'is_demo'),
  'false',
  'agendamentos não são fictícios por padrão'
);

insert into auth.users (id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
values
  ('40000000-0000-4000-8000-000000000001', 'authenticated', 'authenticated', 'video-patient@example.test', '', now(), '{"provider":"email","providers":["email"]}', '{"display_name":"Paciente de teste de vídeo"}', now(), now()),
  ('40000000-0000-4000-8000-000000000002', 'authenticated', 'authenticated', 'video-psychologist@example.test', '', now(), '{"provider":"email","providers":["email"]}', '{"display_name":"Profissional de teste de vídeo"}', now(), now()),
  ('40000000-0000-4000-8000-000000000003', 'authenticated', 'authenticated', 'video-other-patient@example.test', '', now(), '{"provider":"email","providers":["email"]}', '{"display_name":"Outro paciente de teste"}', now(), now());
update public.profiles set role = 'psychologist' where id = '40000000-0000-4000-8000-000000000002';
insert into public.professional_profiles (id, presentation, verification_status)
values ('40000000-0000-4000-8000-000000000002', 'Perfil sintético de videochamada', 'verified');
insert into public.appointments (
  patient_id, professional_id, starts_at, ends_at, price_cents, duration_minutes,
  status, idempotency_key, is_demo
) values (
  '40000000-0000-4000-8000-000000000001', '40000000-0000-4000-8000-000000000002',
  now() + interval '1 hour', now() + interval '1 hour 50 minutes', 5000, 50,
  'confirmed', '50000000-0000-4000-8000-000000000001', true
);

set local role authenticated;
select set_config('request.jwt.claim.sub', '40000000-0000-4000-8000-000000000001', true);
select is((select count(*)::integer from public.get_my_appointments()), 1, 'paciente consulta seu atendimento de teste');
select is((select is_demo from public.get_my_appointments()), true, 'marcador demo só aparece no resumo do participante');

select set_config('request.jwt.claim.sub', '40000000-0000-4000-8000-000000000002', true);
select is((select count(*)::integer from public.get_my_appointments()), 1, 'psicólogo participante consulta a sala associada');

select set_config('request.jwt.claim.sub', '40000000-0000-4000-8000-000000000003', true);
select is((select count(*)::integer from public.get_my_appointments()), 0, 'terceiro não descobre agendamento nem sala');
select is((select count(*)::integer from public.appointments), 0, 'RLS oculta os dados privados de terceiros');
reset role;

select * from finish();
rollback;