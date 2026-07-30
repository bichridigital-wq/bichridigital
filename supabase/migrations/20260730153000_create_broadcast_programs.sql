begin;

create table if not exists public.broadcast_programs (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null,
  category text not null,
  default_description text null,
  default_thumbnail_url text null,
  default_thumbnail_storage_path text null,
  default_duration_minutes integer not null default 60,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint broadcast_programs_name_valid
    check (length(btrim(name)) between 1 and 180),
  constraint broadcast_programs_slug_valid
    check (
      length(slug) between 1 and 140
      and slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'
    ),
  constraint broadcast_programs_category_valid
    check (length(btrim(category)) between 1 and 120),
  constraint broadcast_programs_description_valid
    check (
      default_description is null
      or length(btrim(default_description)) between 1 and 5000
    ),
  constraint broadcast_programs_thumbnail_url_valid
    check (
      default_thumbnail_url is null
      or (
        length(default_thumbnail_url) <= 2048
        and default_thumbnail_url ~* '^https?://[^[:space:]]+$'
      )
    ),
  constraint broadcast_programs_thumbnail_path_valid
    check (
      (
        default_thumbnail_url is null
        and default_thumbnail_storage_path is null
      )
      or (
        default_thumbnail_url is not null
        and default_thumbnail_storage_path ~
          '^programs/[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89aAbB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}/[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89aAbB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}[.](jpg|png|webp)$'
      )
    ),
  constraint broadcast_programs_duration_valid
    check (default_duration_minutes between 15 and 360),
  constraint broadcast_programs_sort_order_valid
    check (sort_order >= 0)
);

create unique index if not exists broadcast_programs_slug_unique_idx
  on public.broadcast_programs (slug);

create index if not exists broadcast_programs_active_order_idx
  on public.broadcast_programs (is_active, sort_order, name);

create or replace function public.set_broadcast_programs_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $function$
begin
  new.name := btrim(new.name);
  new.slug := btrim(new.slug);
  new.category := btrim(new.category);
  new.default_description := nullif(btrim(new.default_description), '');
  new.updated_at := now();
  return new;
end;
$function$;

drop trigger if exists set_broadcast_programs_updated_at
  on public.broadcast_programs;

create trigger set_broadcast_programs_updated_at
before insert or update
on public.broadcast_programs
for each row
execute function public.set_broadcast_programs_updated_at();

alter table public.broadcast_programs enable row level security;

revoke all on table public.broadcast_programs from public;
revoke all on table public.broadcast_programs from anon;
revoke all on table public.broadcast_programs from authenticated;

grant select, insert, update, delete
  on table public.broadcast_programs
  to authenticated;
grant all
  on table public.broadcast_programs
  to service_role;

drop policy if exists "Admins can read broadcast programs"
  on public.broadcast_programs;
create policy "Admins can read broadcast programs"
on public.broadcast_programs
for select
to authenticated
using ((select public.is_admin()));

drop policy if exists "Admins can insert broadcast programs"
  on public.broadcast_programs;
create policy "Admins can insert broadcast programs"
on public.broadcast_programs
for insert
to authenticated
with check ((select public.is_admin()));

drop policy if exists "Admins can update broadcast programs"
  on public.broadcast_programs;
create policy "Admins can update broadcast programs"
on public.broadcast_programs
for update
to authenticated
using ((select public.is_admin()))
with check ((select public.is_admin()));

drop policy if exists "Admins can delete broadcast programs"
  on public.broadcast_programs;
create policy "Admins can delete broadcast programs"
on public.broadcast_programs
for delete
to authenticated
using ((select public.is_admin()));

insert into public.broadcast_programs (
  name,
  slug,
  category,
  default_description,
  default_thumbnail_url,
  default_thumbnail_storage_path,
  default_duration_minutes,
  is_active,
  sort_order
)
values
  ('LI CI BIIR NDIAGNE', 'li-ci-biir-ndiagne', 'Actualité locale', null, null, null, 60, true, 10),
  ('GÀTTANDU MÀGGAL', 'gattandu-maggal', 'Religion', null, null, null, 60, true, 20),
  ('Jotaayu Bichri', 'jotaayu-bichri', 'Magazine', null, null, null, 60, true, 30),
  ('Firi Gent', 'firi-gent', 'Culture', null, null, null, 60, true, 40),
  ('Entretien Spécial', 'entretien-special', 'Interview', null, null, null, 60, true, 50),
  ('Après Ndogou', 'apres-ndogou', 'Religion', null, null, null, 60, true, 60),
  ('Talaatay Cheikh Ibra', 'talaatay-cheikh-ibra', 'Société', null, null, null, 60, true, 70),
  ('Seen Wergu Yaram', 'seen-wergu-yaram', 'Santé et bien-être', null, null, null, 60, true, 80),
  ('Ëttu Jigeen Ñi', 'ettu-jigeen-ni', 'Voix de femmes', null, null, null, 60, true, 90),
  ('Demb ak Tay', 'demb-ak-tay', 'Mémoire et société', null, null, null, 60, true, 100),
  ('Xamxamu Cosaan', 'xamxamu-cosaan', 'Patrimoine', null, null, null, 60, true, 110)
on conflict (slug) do nothing;

alter table public.broadcast_schedule
  add column if not exists program_id uuid null;

alter table public.broadcast_schedule
  drop constraint if exists broadcast_schedule_program_id_fkey;

alter table public.broadcast_schedule
  add constraint broadcast_schedule_program_id_fkey
  foreign key (program_id)
  references public.broadcast_programs(id)
  on delete set null;

create index if not exists broadcast_schedule_program_id_idx
  on public.broadcast_schedule (program_id);

commit;
