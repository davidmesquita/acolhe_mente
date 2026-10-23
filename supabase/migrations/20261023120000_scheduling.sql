begin;

create extension if not exists btree_gist with schema extensions;

do $$ begin
  create type public.appointment_status as enum ('requested', 'confirmed', 'cancelled', 'completed');
exception when duplicate_object then null;
end $$;

create table public.scheduler_settings (
  id boolean primary key default true check (id),
  price_cents integer not null default 5000 check (price_cents >= 0),
  duration_minutes integer not null default 50 check (duration_minutes between 10 and 240),
  cancellation_notice_hours integer not null default 24 check (cancellation_notice_hours between 0 and 720),
  updated_at timestamptz not null default now()
);
insert into public.scheduler_settings (id) values (true) on conflict (id) do nothing;

create table public.professional_availability (
  id uuid primary key default gen_random_uuid(),
  professional_id uuid not null references public.profiles(id) on delete cascade,
  weekday smallint not null check (weekday between 0 and 6),
  starts_at time not null,
  ends_at time not null,
  timezone text not null default 'America/Sao_Paulo' check (char_length(timezone) between 1 and 80),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (professional_id, weekday),
  check (starts_at < ends_at)
);

create table public.schedule_exceptions (
  id uuid primary key default gen_random_uuid(),
  professional_id uuid not null references public.profiles(id) on delete cascade,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  reason text not null default '' check (char_length(reason) <= 160),
  created_at timestamptz not null default now(),
  check (starts_at < ends_at)
);

create table public.appointments (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.profiles(id),
  professional_id uuid not null references public.profiles(id),
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  price_cents integer not null check (price_cents >= 0),
  duration_minutes integer not null check (duration_minutes between 10 and 240),
  status public.appointment_status not null default 'requested',
  idempotency_key uuid not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  cancelled_at timestamptz,
  check (starts_at < ends_at),
  check (ends_at = starts_at + make_interval(mins => duration_minutes)),
  unique (patient_id, idempotency_key),
  exclude using gist (
    professional_id with =,
    tstzrange(starts_at, ends_at, '[)') with &&
  ) where (status in ('requested', 'confirmed'))
);

create index appointments_patient_upcoming_idx
  on public.appointments (patient_id, starts_at) where status in ('requested', 'confirmed');
create index appointments_professional_upcoming_idx
  on public.appointments (professional_id, starts_at) where status in ('requested', 'confirmed');
create index schedule_exceptions_professional_interval_idx
  on public.schedule_exceptions using gist (professional_id, tstzrange(starts_at, ends_at, '[)'));

create or replace function private.lock_professional_schedule(professional_uuid uuid)
returns void
language sql volatile security definer
set search_path = ''
as $$ select pg_advisory_xact_lock(hashtextextended(professional_uuid::text, 0)) $$;
revoke all on function private.lock_professional_schedule(uuid) from public, anon, authenticated;

create or replace function private.lock_schedule_changes()
returns trigger
language plpgsql security definer
set search_path = ''
as $$
begin
  perform private.lock_professional_schedule(
    case when tg_op = 'DELETE' then old.professional_id else new.professional_id end
  );
  if tg_table_name = 'schedule_exceptions' and tg_op <> 'DELETE' and exists (
    select 1 from public.appointments a
    where a.professional_id = new.professional_id
      and a.status in ('requested', 'confirmed')
      and tstzrange(a.starts_at, a.ends_at, '[)') && tstzrange(new.starts_at, new.ends_at, '[)')
  ) then
    raise exception using errcode = 'P0001', message = 'BLOCK_OVERLAPS_APPOINTMENT';
  end if;
  if tg_op = 'DELETE' then return old; end if;
  return new;
end;
$$;
revoke all on function private.lock_schedule_changes() from public, anon, authenticated;
create trigger professional_availability_serializes_changes
  before insert or update or delete on public.professional_availability
  for each row execute function private.lock_schedule_changes();
create trigger schedule_exceptions_serializes_changes
  before insert or update or delete on public.schedule_exceptions
  for each row execute function private.lock_schedule_changes();

alter table public.scheduler_settings enable row level security;
alter table public.professional_availability enable row level security;
alter table public.schedule_exceptions enable row level security;
alter table public.appointments enable row level security;

revoke all on public.scheduler_settings, public.professional_availability,
  public.schedule_exceptions, public.appointments from public, anon, authenticated;
grant select on public.scheduler_settings to authenticated;
grant select, delete on public.professional_availability to authenticated;
grant select, insert, update, delete on public.schedule_exceptions to authenticated;
grant select on public.appointments to authenticated;
grant all on public.scheduler_settings, public.professional_availability,
  public.schedule_exceptions, public.appointments to service_role;

create policy scheduler_settings_authenticated_read on public.scheduler_settings
  for select to authenticated using (true);
create policy professional_availability_owner_read on public.professional_availability
  for select to authenticated using (
    professional_id = (select auth.uid()) and (select private.current_user_role()) = 'psychologist'
  );
create policy professional_availability_owner_delete on public.professional_availability
  for delete to authenticated using (
    professional_id = (select auth.uid()) and (select private.current_user_role()) = 'psychologist'
  );
create policy schedule_exceptions_owner_read on public.schedule_exceptions
  for select to authenticated using (
    professional_id = (select auth.uid()) and (select private.current_user_role()) = 'psychologist'
  );
create policy schedule_exceptions_owner_insert on public.schedule_exceptions
  for insert to authenticated with check (
    professional_id = (select auth.uid()) and (select private.current_user_role()) = 'psychologist'
  );
create policy schedule_exceptions_owner_update on public.schedule_exceptions
  for update to authenticated using (
    professional_id = (select auth.uid()) and (select private.current_user_role()) = 'psychologist'
  ) with check (
    professional_id = (select auth.uid()) and (select private.current_user_role()) = 'psychologist'
  );
create policy schedule_exceptions_owner_delete on public.schedule_exceptions
  for delete to authenticated using (
    professional_id = (select auth.uid()) and (select private.current_user_role()) = 'psychologist'
  );
create policy appointments_participant_read on public.appointments
  for select to authenticated using (
    patient_id = (select auth.uid()) or professional_id = (select auth.uid())
  );

create or replace function public.get_scheduler_settings()
returns table (price_cents integer, duration_minutes integer, cancellation_notice_hours integer)
language sql stable security definer
set search_path = ''
as $$
  select s.price_cents, s.duration_minutes, s.cancellation_notice_hours
  from public.scheduler_settings s where s.id
$$;
revoke all on function public.get_scheduler_settings() from public;
grant execute on function public.get_scheduler_settings() to anon, authenticated;

create or replace function public.get_professional_timezone(professional_uuid uuid)
returns text
language sql stable security definer
set search_path = ''
as $$
  select a.timezone
  from public.professional_availability a
  join public.profiles p on p.id = a.professional_id
  join public.professional_profiles pp on pp.id = p.id
  where a.professional_id = professional_uuid and p.role = 'psychologist'
    and pp.verification_status = 'verified'
  order by a.weekday
  limit 1
$$;
revoke all on function public.get_professional_timezone(uuid) from public;
grant execute on function public.get_professional_timezone(uuid) to anon, authenticated;

create or replace function public.save_professional_availability(availability jsonb)
returns void
language plpgsql security definer
set search_path = ''
as $$
begin
  if auth.uid() is null or (select private.current_user_role()) is distinct from 'psychologist' then
    raise exception using errcode = '42501', message = 'PSYCHOLOGIST_AUTHENTICATION_REQUIRED';
  end if;
  if jsonb_typeof(availability) <> 'array' or jsonb_array_length(availability) > 7 then
    raise exception using errcode = '22023', message = 'INVALID_AVAILABILITY';
  end if;
  if exists (
    select 1 from jsonb_array_elements(availability) item
    where not exists (select 1 from pg_timezone_names zone where zone.name = item.value ->> 'timezone')
  ) then
    raise exception using errcode = '22023', message = 'INVALID_TIMEZONE';
  end if;
  if (select count(distinct item.value ->> 'timezone') from jsonb_array_elements(availability) item) > 1 then
    raise exception using errcode = '22023', message = 'SCHEDULE_TIMEZONE_MUST_BE_UNIFORM';
  end if;
  perform private.lock_professional_schedule(auth.uid());
  delete from public.professional_availability where professional_id = auth.uid();
  insert into public.professional_availability (professional_id, weekday, starts_at, ends_at, timezone)
  select auth.uid(), entry.weekday, entry.starts_at, entry.ends_at, entry.timezone
  from jsonb_to_recordset(availability) as entry(
    weekday smallint, starts_at time, ends_at time, timezone text
  );
end;
$$;
revoke all on function public.save_professional_availability(jsonb) from public, anon;
grant execute on function public.save_professional_availability(jsonb) to authenticated;

create or replace function public.get_available_slots(professional_uuid uuid, local_date date)
returns table (
  starts_at timestamptz,
  ends_at timestamptz,
  timezone text,
  price_cents integer,
  duration_minutes integer
)
language sql stable security definer
set search_path = ''
as $$
  with settings as (
    select s.price_cents, s.duration_minutes from public.scheduler_settings s where s.id
  ), dates as (
    select day::date as local_day
    from generate_series(local_date, local_date + 20, interval '1 day') as calendar_days(day)
  ), candidates as (
    select
      (dates.local_day + a.starts_at + make_interval(mins => slots.slot_index * s.duration_minutes)) as local_start,
      a.ends_at as local_end,
      a.timezone,
      s.price_cents,
      s.duration_minutes
    from public.professional_availability a
    cross join settings s
    cross join dates
    cross join lateral generate_series(
      0,
      floor(extract(epoch from (a.ends_at - a.starts_at)) / 60 / s.duration_minutes)::integer
    ) as slots(slot_index)
    where a.professional_id = professional_uuid
      and a.weekday = extract(dow from dates.local_day)::smallint
      and dates.local_day between (now() at time zone a.timezone)::date
        and (now() at time zone a.timezone)::date + 90
      and exists (
        select 1 from public.profiles p
        join public.professional_profiles pp on pp.id = p.id
        where p.id = professional_uuid and p.role = 'psychologist'
          and pp.verification_status = 'verified'
      )
  ), utc_candidates as (
    select c.*, c.local_start at time zone c.timezone as utc_start from candidates c
  )
  select
    c.utc_start,
    c.utc_start + make_interval(mins => c.duration_minutes),
    c.timezone,
    c.price_cents,
    c.duration_minutes
  from utc_candidates c
  where c.local_start + make_interval(mins => c.duration_minutes) <= local_date + c.local_end
    and c.utc_start > now()
    and c.utc_start at time zone c.timezone = c.local_start
    and not exists (
      select 1 from public.schedule_exceptions e
      where e.professional_id = professional_uuid
        and tstzrange(e.starts_at, e.ends_at, '[)') &&
            tstzrange(c.utc_start, c.utc_start + make_interval(mins => c.duration_minutes), '[)')
    )
    and not exists (
      select 1 from public.appointments a
      where a.professional_id = professional_uuid and a.status in ('requested', 'confirmed')
        and tstzrange(a.starts_at, a.ends_at, '[)') &&
            tstzrange(c.utc_start, c.utc_start + make_interval(mins => c.duration_minutes), '[)')
    )
  order by c.utc_start
$$;
revoke all on function public.get_available_slots(uuid, date) from public;
grant execute on function public.get_available_slots(uuid, date) to anon, authenticated;

create or replace function public.request_appointment(
  professional_uuid uuid,
  slot_start timestamptz,
  request_key uuid
)
returns uuid
language plpgsql security definer
set search_path = ''
as $$
declare
  caller uuid := auth.uid();
  settings public.scheduler_settings%rowtype;
  existing public.appointments%rowtype;
  schedule public.professional_availability%rowtype;
  local_start timestamp;
  appointment_uuid uuid;
begin
  if caller is null or (select private.current_user_role()) is distinct from 'patient' then
    raise exception using errcode = '42501', message = 'PATIENT_AUTHENTICATION_REQUIRED';
  end if;
  if request_key is null then
    raise exception using errcode = '22023', message = 'IDEMPOTENCY_KEY_REQUIRED';
  end if;

  perform pg_advisory_xact_lock(hashtextextended(caller::text || ':' || request_key::text, 1));
  select * into existing from public.appointments a
  where a.patient_id = caller and a.idempotency_key = request_key;
  if found then
    if existing.professional_id = professional_uuid and existing.starts_at = slot_start then
      return existing.id;
    end if;
    raise exception using errcode = '22023', message = 'IDEMPOTENCY_KEY_REUSED';
  end if;

  perform private.lock_professional_schedule(professional_uuid);
  select * into settings from public.scheduler_settings s where s.id;
  if not exists (
    select 1 from public.profiles p
    join public.professional_profiles pp on pp.id = p.id
    where p.id = professional_uuid and p.role = 'psychologist'
      and pp.verification_status = 'verified'
  ) then
    raise exception using errcode = 'P0001', message = 'PROFESSIONAL_UNAVAILABLE';
  end if;
  select * into schedule from public.professional_availability a
  where a.professional_id = professional_uuid
    and a.weekday = extract(dow from slot_start at time zone a.timezone)::smallint
  limit 1;
  if not found then
    raise exception using errcode = 'P0001', message = 'SLOT_UNAVAILABLE';
  end if;
  local_start := slot_start at time zone schedule.timezone;
  if local_start::date + schedule.starts_at > local_start
    or local_start + make_interval(mins => settings.duration_minutes) > local_start::date + schedule.ends_at
    or extract(epoch from (local_start::time - schedule.starts_at))::integer
      % (settings.duration_minutes * 60) <> 0
    or slot_start <= now()
    or (local_start at time zone schedule.timezone) <> slot_start
  then
    raise exception using errcode = 'P0001', message = 'SLOT_UNAVAILABLE';
  end if;
  if exists (
    select 1 from public.schedule_exceptions e
    where e.professional_id = professional_uuid
      and tstzrange(e.starts_at, e.ends_at, '[)') &&
          tstzrange(slot_start, slot_start + make_interval(mins => settings.duration_minutes), '[)')
  ) or exists (
    select 1 from public.appointments a
    where a.professional_id = professional_uuid and a.status in ('requested', 'confirmed')
      and tstzrange(a.starts_at, a.ends_at, '[)') &&
          tstzrange(slot_start, slot_start + make_interval(mins => settings.duration_minutes), '[)')
  ) then
    raise exception using errcode = 'P0001', message = 'SLOT_UNAVAILABLE';
  end if;

  insert into public.appointments (
    patient_id, professional_id, starts_at, ends_at, price_cents, duration_minutes, idempotency_key
  ) values (
    caller, professional_uuid, slot_start,
    slot_start + make_interval(mins => settings.duration_minutes),
    settings.price_cents, settings.duration_minutes, request_key
  ) returning id into appointment_uuid;
  return appointment_uuid;
exception when exclusion_violation then
  raise exception using errcode = 'P0001', message = 'SLOT_UNAVAILABLE';
end;
$$;
revoke all on function public.request_appointment(uuid, timestamptz, uuid) from public, anon;
grant execute on function public.request_appointment(uuid, timestamptz, uuid) to authenticated;

create or replace function public.cancel_appointment(appointment_uuid uuid)
returns void
language plpgsql security definer
set search_path = ''
as $$
declare
  caller uuid := auth.uid();
  current_appointment public.appointments%rowtype;
  cancellation_hours integer;
begin
  if caller is null then raise exception using errcode = '42501', message = 'AUTHENTICATION_REQUIRED'; end if;
  select * into current_appointment from public.appointments a where a.id = appointment_uuid for update;
  if not found or (current_appointment.patient_id <> caller and current_appointment.professional_id <> caller) then
    raise exception using errcode = '42501', message = 'APPOINTMENT_NOT_FOUND';
  end if;
  if current_appointment.status = 'cancelled' then return; end if;
  if current_appointment.status not in ('requested', 'confirmed') then
    raise exception using errcode = 'P0001', message = 'APPOINTMENT_NOT_CANCELLABLE';
  end if;
  if current_appointment.patient_id = caller then
    select s.cancellation_notice_hours into cancellation_hours
    from public.scheduler_settings s where s.id;
    if now() > current_appointment.starts_at - make_interval(hours => cancellation_hours) then
      raise exception using errcode = 'P0001', message = 'CANCELLATION_WINDOW_CLOSED';
    end if;
  elsif (select private.current_user_role()) is distinct from 'psychologist' then
    raise exception using errcode = '42501', message = 'APPOINTMENT_NOT_FOUND';
  end if;
  update public.appointments set status = 'cancelled', cancelled_at = now(), updated_at = now()
  where id = appointment_uuid;
end;
$$;
revoke all on function public.cancel_appointment(uuid) from public, anon;
grant execute on function public.cancel_appointment(uuid) to authenticated;

create or replace function public.set_appointment_status(appointment_uuid uuid, next_status public.appointment_status)
returns void
language plpgsql security definer
set search_path = ''
as $$
declare
  current_appointment public.appointments%rowtype;
begin
  if auth.uid() is null or (select private.current_user_role()) is distinct from 'psychologist' then
    raise exception using errcode = '42501', message = 'PSYCHOLOGIST_AUTHENTICATION_REQUIRED';
  end if;
  select * into current_appointment from public.appointments a
  where a.id = appointment_uuid and a.professional_id = auth.uid() for update;
  if not found then raise exception using errcode = '42501', message = 'APPOINTMENT_NOT_FOUND'; end if;
  if next_status = 'confirmed' and current_appointment.status = 'requested' then
    update public.appointments set status = next_status, updated_at = now() where id = appointment_uuid;
  elsif next_status = 'completed' and current_appointment.status = 'confirmed'
    and current_appointment.ends_at <= now() then
    update public.appointments set status = next_status, updated_at = now() where id = appointment_uuid;
  elsif next_status = 'cancelled' and current_appointment.status in ('requested', 'confirmed') then
    update public.appointments set status = next_status, cancelled_at = now(), updated_at = now()
    where id = appointment_uuid;
  else
    raise exception using errcode = 'P0001', message = 'INVALID_APPOINTMENT_TRANSITION';
  end if;
end;
$$;
revoke all on function public.set_appointment_status(uuid, public.appointment_status) from public, anon;
grant execute on function public.set_appointment_status(uuid, public.appointment_status) to authenticated;

create or replace function public.reschedule_appointment(
  appointment_uuid uuid,
  slot_start timestamptz,
  request_key uuid
)
returns uuid
language plpgsql security definer
set search_path = ''
as $$
declare
  caller uuid := auth.uid();
  current_appointment public.appointments%rowtype;
  existing public.appointments%rowtype;
begin
  if caller is null or (select private.current_user_role()) is distinct from 'patient' then
    raise exception using errcode = '42501', message = 'PATIENT_AUTHENTICATION_REQUIRED';
  end if;
  if request_key is null then raise exception using errcode = '22023', message = 'IDEMPOTENCY_KEY_REQUIRED'; end if;
  perform pg_advisory_xact_lock(hashtextextended(caller::text || ':' || request_key::text, 1));
  select * into existing from public.appointments a
  where a.patient_id = caller and a.idempotency_key = request_key;
  if found then
    select * into current_appointment from public.appointments a where a.id = appointment_uuid;
    if existing.professional_id = current_appointment.professional_id and existing.starts_at = slot_start
      and current_appointment.patient_id = caller then
      return existing.id;
    end if;
    raise exception using errcode = '22023', message = 'IDEMPOTENCY_KEY_REUSED';
  end if;
  select * into current_appointment from public.appointments a
  where a.id = appointment_uuid and a.patient_id = caller for update;
  if not found then raise exception using errcode = '42501', message = 'APPOINTMENT_NOT_FOUND'; end if;
  perform public.cancel_appointment(appointment_uuid);
  return public.request_appointment(current_appointment.professional_id, slot_start, request_key);
end;
$$;
revoke all on function public.reschedule_appointment(uuid, timestamptz, uuid) from public, anon;
grant execute on function public.reschedule_appointment(uuid, timestamptz, uuid) to authenticated;

create or replace function public.get_my_appointments()
returns table (
  id uuid,
  starts_at timestamptz,
  ends_at timestamptz,
  price_cents integer,
  duration_minutes integer,
  status public.appointment_status,
  other_party_name text,
  timezone text,
  professional_id uuid
)
language plpgsql stable security definer
set search_path = ''
as $$
begin
  if auth.uid() is null then raise exception using errcode = '42501', message = 'AUTHENTICATION_REQUIRED'; end if;
  return query
  select a.id, a.starts_at, a.ends_at, a.price_cents, a.duration_minutes, a.status,
    p.display_name,
    case when a.professional_id = auth.uid() then
      (select a_timezone.timezone from public.professional_availability a_timezone
        where a_timezone.professional_id = a.professional_id order by a_timezone.weekday limit 1)
      else null end,
    a.professional_id
  from public.appointments a
  join public.profiles p on p.id = case
    when a.patient_id = auth.uid() then a.professional_id else a.patient_id end
  where a.patient_id = auth.uid() or a.professional_id = auth.uid()
  order by a.starts_at;
end;
$$;
revoke all on function public.get_my_appointments() from public, anon;
grant execute on function public.get_my_appointments() to authenticated;

commit;