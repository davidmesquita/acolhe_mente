begin;

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create or replace function private.valid_text_list(entries text[])
returns boolean
language sql immutable
set search_path = ''
as $$
  select coalesce(array_length(entries, 1), 0) <= 20
    and not exists (select 1 from unnest(coalesce(entries, '{}'::text[])) as items(value)
      where char_length(value) > 80 or btrim(value) = '')
$$;
revoke all on function private.valid_text_list(text[]) from public, anon, authenticated;
grant usage on schema private to authenticated, service_role;
grant execute on function private.valid_text_list(text[]) to authenticated, service_role;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null check (char_length(display_name) between 1 and 100),
  role text not null default 'patient' check (role in ('patient', 'psychologist', 'admin')),
  created_at timestamptz not null default now()
);

create table public.professional_profiles (
  id uuid primary key references public.profiles(id) on delete cascade,
  presentation text not null default '' check (char_length(presentation) <= 2000),
  specialties text[] not null default '{}' check (private.valid_text_list(specialties)),
  registration_number text check (registration_number is null or char_length(registration_number) <= 100),
  verification_status text not null default 'pending' check (verification_status in ('pending', 'verified', 'rejected')),
  accessibility_modalities text[] not null default '{}' check (private.valid_text_list(accessibility_modalities)),
  created_at timestamptz not null default now()
);

create or replace function private.current_user_role()
returns text
language sql stable security definer
set search_path = ''
as $$ select role from public.profiles where id = (select auth.uid()) $$;
revoke all on function private.current_user_role() from public, anon;
grant usage on schema private to authenticated;
grant execute on function private.current_user_role() to authenticated;

create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer
set search_path = ''
as $$
begin
  insert into public.profiles(id, display_name, role)
  values (new.id,
    coalesce(nullif(left(trim(new.raw_user_meta_data ->> 'display_name'), 100), ''), 'Pessoa usuária'),
    'patient');
  return new;
end;
$$;
revoke all on function public.handle_new_user() from public, anon, authenticated;
create trigger on_auth_user_created after insert on auth.users
for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.professional_profiles enable row level security;

revoke all on public.profiles from public, anon, authenticated;
grant all on public.profiles to service_role;
grant select on public.profiles to authenticated;
grant update (display_name) on public.profiles to authenticated;
create policy profiles_select_self_or_admin on public.profiles for select to authenticated
using (id = (select auth.uid()) or (select private.current_user_role()) = 'admin');
create policy profiles_update_self_or_admin_name on public.profiles for update to authenticated
using (id = (select auth.uid()) or (select private.current_user_role()) = 'admin')
with check (id = (select auth.uid()) or (select private.current_user_role()) = 'admin');

revoke all on public.professional_profiles from public, anon, authenticated;
grant all on public.professional_profiles to service_role;
grant select (id, presentation, specialties, registration_number, verification_status, accessibility_modalities, created_at)
  on public.professional_profiles to authenticated;
grant insert (id, presentation, specialties, registration_number, accessibility_modalities)
  on public.professional_profiles to authenticated;
grant update (presentation, specialties, registration_number, accessibility_modalities)
  on public.professional_profiles to authenticated;
create policy professional_profiles_read_verified_self_admin on public.professional_profiles for select to authenticated
using (verification_status = 'verified' or id = (select auth.uid()) or (select private.current_user_role()) = 'admin');
create policy professional_profiles_insert_self on public.professional_profiles for insert to authenticated
with check (id = (select auth.uid()) and (select private.current_user_role()) = 'psychologist');
create policy professional_profiles_update_self on public.professional_profiles for update to authenticated
using (id = (select auth.uid()) and (select private.current_user_role()) = 'psychologist')
with check (id = (select auth.uid()) and (select private.current_user_role()) = 'psychologist');

create view public.verified_professional_profiles
with (security_barrier = true)
as select pp.id, p.display_name, pp.presentation, pp.specialties,
          pp.registration_number, pp.accessibility_modalities
from public.professional_profiles pp
join public.profiles p on p.id = pp.id
where pp.verification_status = 'verified' and p.role = 'psychologist';
revoke all on public.verified_professional_profiles from public, authenticated, anon;
grant select on public.verified_professional_profiles to authenticated, anon;

commit;
