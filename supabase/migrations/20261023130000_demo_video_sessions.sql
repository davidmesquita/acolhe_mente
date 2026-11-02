begin;

alter table public.appointments
  add column is_demo boolean not null default false;

drop function public.get_my_appointments();

create function public.get_my_appointments()
returns table (
  id uuid,
  starts_at timestamptz,
  ends_at timestamptz,
  price_cents integer,
  duration_minutes integer,
  status public.appointment_status,
  other_party_name text,
  timezone text,
  professional_id uuid,
  is_demo boolean
)
language plpgsql stable security definer
set search_path = ''
as $$
begin
  if auth.uid() is null then
    raise exception using errcode = '42501', message = 'AUTHENTICATION_REQUIRED';
  end if;
  return query
  select a.id, a.starts_at, a.ends_at, a.price_cents, a.duration_minutes, a.status,
    p.display_name,
    case when a.professional_id = auth.uid() then
      (select a_timezone.timezone from public.professional_availability a_timezone
        where a_timezone.professional_id = a.professional_id order by a_timezone.weekday limit 1)
      else null end,
    a.professional_id,
    a.is_demo
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