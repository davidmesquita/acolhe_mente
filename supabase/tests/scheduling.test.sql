begin;
create extension if not exists pgtap with schema extensions;
select no_plan();

select has_table('public', 'professional_availability', 'disponibilidade semanal existe');
select has_table('public', 'schedule_exceptions', 'exceções de agenda existem');
select has_table('public', 'appointments', 'agendamentos existem');
select ok((select relrowsecurity from pg_class where oid = 'public.appointments'::regclass), 'RLS protege agendamentos');
select ok((select contype = 'x' from pg_constraint where conrelid = 'public.appointments'::regclass limit 1), 'intervalos ativos têm restrição de exclusão contra sobreposição');
select ok(not has_table_privilege('anon', 'public.appointments', 'SELECT'), 'anon não consulta agendamentos');
select ok(not has_table_privilege('authenticated', 'public.appointments', 'INSERT'), 'cliente não insere agendamento diretamente');

insert into auth.users (id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
values
  ('20000000-0000-4000-8000-000000000001', 'authenticated', 'authenticated', 'schedule-patient-a@example.test', '', now(), '{"provider":"email","providers":["email"]}', '{"display_name":"Paciente Agenda A"}', now(), now()),
  ('20000000-0000-4000-8000-000000000002', 'authenticated', 'authenticated', 'schedule-patient-b@example.test', '', now(), '{"provider":"email","providers":["email"]}', '{"display_name":"Paciente Agenda B"}', now(), now()),
  ('20000000-0000-4000-8000-000000000003', 'authenticated', 'authenticated', 'schedule-psychologist@example.test', '', now(), '{"provider":"email","providers":["email"]}', '{"display_name":"Profissional Agenda"}', now(), now()),
  ('20000000-0000-4000-8000-000000000004', 'authenticated', 'authenticated', 'schedule-psychologist-other@example.test', '', now(), '{"provider":"email","providers":["email"]}', '{"display_name":"Outro Profissional"}', now(), now());
update public.profiles set role = 'psychologist' where id = '20000000-0000-4000-8000-000000000003';
update public.profiles set role = 'psychologist' where id = '20000000-0000-4000-8000-000000000004';
insert into public.professional_profiles (id, presentation, verification_status)
values
  ('20000000-0000-4000-8000-000000000003', 'Perfil fictício de pgTAP', 'verified'),
  ('20000000-0000-4000-8000-000000000004', 'Segundo perfil fictício de pgTAP', 'verified');

select set_config('test.schedule_date', ((now() at time zone 'America/Sao_Paulo')::date + 2)::text, true);
insert into public.professional_availability (professional_id, weekday, starts_at, ends_at, timezone)
values (
  '20000000-0000-4000-8000-000000000003',
  extract(dow from current_setting('test.schedule_date')::date)::smallint,
  '22:00', '23:40', 'America/Sao_Paulo'
);
insert into public.schedule_exceptions (professional_id, starts_at, ends_at, reason)
values (
  '20000000-0000-4000-8000-000000000003',
  (current_setting('test.schedule_date')::date + time '22:50') at time zone 'America/Sao_Paulo',
  (current_setting('test.schedule_date')::date + time '23:40') at time zone 'America/Sao_Paulo',
  'Bloqueio de teste'
);

set local role authenticated;
select set_config('request.jwt.claim.sub', '20000000-0000-4000-8000-000000000001', true);
select is((select price_cents from public.get_scheduler_settings()), 5000, 'preço inicial vem da configuração do sistema');
select is((select duration_minutes from public.get_scheduler_settings()), 50, 'duração inicial vem da configuração do sistema');
select is((select count(*)::integer from public.get_available_slots(
  '20000000-0000-4000-8000-000000000003', current_setting('test.schedule_date')::date
) slot
where (slot.starts_at at time zone slot.timezone)::date = current_setting('test.schedule_date')::date),
  1, 'slot bloqueado não aparece e o horário válido permanece');
select lives_ok($$ select public.request_appointment(
  '20000000-0000-4000-8000-000000000003',
  (current_setting('test.schedule_date')::date + time '22:00') at time zone 'America/Sao_Paulo',
  '30000000-0000-4000-8000-000000000001'
) $$, 'paciente reserva horário válido para si');
select is((select status::text from public.appointments where patient_id = auth.uid()), 'requested', 'reserva começa solicitada');
select is((select price_cents from public.appointments where patient_id = auth.uid()), 5000, 'preço não é escolhido pelo cliente');
select is((select duration_minutes from public.appointments where patient_id = auth.uid()), 50, 'duração completa é persistida');
select is(
  public.request_appointment(
    '20000000-0000-4000-8000-000000000003',
    (current_setting('test.schedule_date')::date + time '22:00') at time zone 'America/Sao_Paulo',
    '30000000-0000-4000-8000-000000000001'
  ),
  (select id from public.appointments where patient_id = auth.uid()),
  'repetir a requisição idempotente retorna a reserva existente'
);
select throws_ok($$ select public.request_appointment(
  '20000000-0000-4000-8000-000000000003',
  (current_setting('test.schedule_date')::date + time '22:50') at time zone 'America/Sao_Paulo',
  '30000000-0000-4000-8000-000000000002'
) $$, 'P0001', 'SLOT_UNAVAILABLE', 'horário bloqueado não pode ser reservado');
select throws_ok($$ insert into public.appointments (
  patient_id, professional_id, starts_at, ends_at, price_cents, duration_minutes, idempotency_key
) values (
  '20000000-0000-4000-8000-000000000002', '20000000-0000-4000-8000-000000000003',
  (current_setting('test.schedule_date')::date + time '22:30') at time zone 'America/Sao_Paulo',
  (current_setting('test.schedule_date')::date + time '23:20') at time zone 'America/Sao_Paulo',
  5000, 50, '30000000-0000-4000-8000-000000000003'
) $$, '42501', null, 'cliente não insere intervalos sobrepostos diretamente');
select throws_ok($$ insert into public.professional_availability (professional_id, weekday, starts_at, ends_at)
values ('20000000-0000-4000-8000-000000000003', 1, '09:00', '10:00') $$,
  '42501', null, 'paciente não altera disponibilidade profissional');
select is((select count(*)::integer from public.get_my_appointments()), 1, 'paciente consulta seu próprio agendamento');
reset role;
set local role service_role;
update public.scheduler_settings set cancellation_notice_hours = 72 where id;
reset role;
set local role authenticated;
select set_config('request.jwt.claim.sub', '20000000-0000-4000-8000-000000000001', true);
select throws_ok($$ select public.cancel_appointment((select id from public.appointments where patient_id = auth.uid())) $$,
  'P0001', 'CANCELLATION_WINDOW_CLOSED', 'prazo de cancelamento configurado é aplicado no servidor');
reset role;
set local role service_role;
update public.scheduler_settings set cancellation_notice_hours = 24 where id;
reset role;
set local role authenticated;
select set_config('request.jwt.claim.sub', '20000000-0000-4000-8000-000000000001', true);
select lives_ok($$ select public.cancel_appointment((select id from public.appointments where patient_id = auth.uid())) $$,
  'paciente cancela dentro da política configurada');
select is((select status::text from public.appointments where patient_id = auth.uid()), 'cancelled', 'cancelamento libera o intervalo');

select set_config('request.jwt.claim.sub', '20000000-0000-4000-8000-000000000002', true);
select is((select count(*)::integer from public.get_my_appointments()), 0, 'outro paciente não vê agendamentos de terceiros');
select is((select count(*)::integer from public.appointments), 0, 'RLS oculta linhas de terceiros na tabela');
select throws_ok($$ select public.request_appointment(
  '20000000-0000-4000-8000-000000000003',
  (current_setting('test.schedule_date')::date + time '22:00') at time zone 'America/Sao_Paulo',
  '30000000-0000-4000-8000-000000000004'
) $$, 'P0001', 'SLOT_UNAVAILABLE', 'slot ocupado não aceita segunda reserva');
select throws_ok($$ select public.cancel_appointment(
  (select id from public.appointments where patient_id = '20000000-0000-4000-8000-000000000001')
) $$, '42501', 'APPOINTMENT_NOT_FOUND', 'paciente não cancela agendamento de terceiros');
select lives_ok($$ select public.request_appointment(
  '20000000-0000-4000-8000-000000000003',
  (current_setting('test.schedule_date')::date + time '22:00') at time zone 'America/Sao_Paulo',
  '30000000-0000-4000-8000-000000000005'
) $$, 'slot cancelado pode ser reservado novamente');
reset role;

set local role service_role;
select throws_ok($$ insert into public.appointments (
  patient_id, professional_id, starts_at, ends_at, price_cents, duration_minutes, idempotency_key
) values (
  '20000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000003',
  (current_setting('test.schedule_date')::date + time '22:30') at time zone 'America/Sao_Paulo',
  (current_setting('test.schedule_date')::date + time '23:20') at time zone 'America/Sao_Paulo',
  5000, 50, '30000000-0000-4000-8000-000000000006'
) $$, '23P01', null, 'constraint do banco rejeita sobreposição parcial do intervalo');
reset role;

set local role authenticated;
select set_config('request.jwt.claim.sub', '20000000-0000-4000-8000-000000000003', true);
select is((select count(*)::integer from public.get_my_appointments()), 1, 'profissional consulta sua própria agenda');
select throws_ok($$ insert into public.schedule_exceptions (professional_id, starts_at, ends_at)
values (
  '20000000-0000-4000-8000-000000000004',
  (current_setting('test.schedule_date')::date + time '12:00') at time zone 'America/Sao_Paulo',
  (current_setting('test.schedule_date')::date + time '13:00') at time zone 'America/Sao_Paulo'
) $$, '42501', null, 'profissional não administra bloqueios de outra agenda');
select throws_ok($$ insert into public.schedule_exceptions (professional_id, starts_at, ends_at)
values (
  auth.uid(),
  (current_setting('test.schedule_date')::date + time '22:00') at time zone 'America/Sao_Paulo',
  (current_setting('test.schedule_date')::date + time '22:50') at time zone 'America/Sao_Paulo'
) $$, 'P0001', 'BLOCK_OVERLAPS_APPOINTMENT', 'bloqueio não pode cobrir atendimento ativo');
reset role;

select * from finish();
rollback;