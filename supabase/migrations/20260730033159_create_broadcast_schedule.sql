begin;

create extension if not exists pgcrypto;

create table if not exists public.broadcast_schedule (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text null,
  description text null,
  category text null,
  scheduled_start_time timestamptz not null,
  scheduled_end_time timestamptz null,
  status text not null default 'scheduled',
  youtube_video_id text null,
  thumbnail_url text null,
  location text null,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint broadcast_schedule_title_valid
    check (length(btrim(title)) between 1 and 180),
  constraint broadcast_schedule_slug_valid
    check (
      slug is null
      or (
        length(slug) between 1 and 140
        and slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'
      )
    ),
  constraint broadcast_schedule_description_valid
    check (
      description is null
      or length(btrim(description)) between 1 and 5000
    ),
  constraint broadcast_schedule_category_valid
    check (
      category is null
      or length(btrim(category)) between 1 and 120
    ),
  constraint broadcast_schedule_end_after_start
    check (
      scheduled_end_time is null
      or scheduled_end_time > scheduled_start_time
    ),
  constraint broadcast_schedule_status_allowed
    check (status in ('scheduled', 'cancelled', 'completed')),
  constraint broadcast_schedule_youtube_video_id_valid
    check (
      youtube_video_id is null
      or youtube_video_id ~ '^[A-Za-z0-9_-]{11}$'
    ),
  constraint broadcast_schedule_thumbnail_url_valid
    check (
      thumbnail_url is null
      or (
        length(thumbnail_url) <= 2048
        and thumbnail_url ~* '^https?://[^[:space:]]+$'
      )
    ),
  constraint broadcast_schedule_location_valid
    check (
      location is null
      or length(btrim(location)) between 1 and 200
    )
);

create index if not exists broadcast_schedule_start_idx
  on public.broadcast_schedule (scheduled_start_time);

create index if not exists broadcast_schedule_published_start_idx
  on public.broadcast_schedule (is_published, scheduled_start_time);

create index if not exists broadcast_schedule_status_idx
  on public.broadcast_schedule (status);

create unique index if not exists broadcast_schedule_slug_unique_idx
  on public.broadcast_schedule (slug)
  where slug is not null;

create or replace function public.set_broadcast_schedule_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $function$
begin
  new.slug := nullif(btrim(new.slug), '');
  new.description := nullif(btrim(new.description), '');
  new.category := nullif(btrim(new.category), '');
  new.youtube_video_id := nullif(btrim(new.youtube_video_id), '');
  new.thumbnail_url := nullif(btrim(new.thumbnail_url), '');
  new.location := nullif(btrim(new.location), '');
  new.updated_at := now();
  return new;
end;
$function$;

drop trigger if exists set_broadcast_schedule_updated_at
  on public.broadcast_schedule;

create trigger set_broadcast_schedule_updated_at
before insert or update
on public.broadcast_schedule
for each row
execute function public.set_broadcast_schedule_updated_at();

alter table public.broadcast_schedule enable row level security;

revoke all on table public.broadcast_schedule from public;
revoke all on table public.broadcast_schedule from anon;
revoke all on table public.broadcast_schedule from authenticated;

grant select on table public.broadcast_schedule to anon;
grant select, insert, update, delete
  on table public.broadcast_schedule
  to authenticated;
grant all on table public.broadcast_schedule to service_role;

drop policy if exists
  "Public can read published broadcast schedule"
  on public.broadcast_schedule;

create policy
  "Public can read published broadcast schedule"
on public.broadcast_schedule
for select
to anon, authenticated
using (is_published = true);

drop policy if exists
  "Admins can read all broadcast schedule"
  on public.broadcast_schedule;

create policy
  "Admins can read all broadcast schedule"
on public.broadcast_schedule
for select
to authenticated
using ((select public.is_admin()));

drop policy if exists
  "Admins can insert broadcast schedule"
  on public.broadcast_schedule;

create policy
  "Admins can insert broadcast schedule"
on public.broadcast_schedule
for insert
to authenticated
with check ((select public.is_admin()));

drop policy if exists
  "Admins can update broadcast schedule"
  on public.broadcast_schedule;

create policy
  "Admins can update broadcast schedule"
on public.broadcast_schedule
for update
to authenticated
using ((select public.is_admin()))
with check ((select public.is_admin()));

drop policy if exists
  "Admins can delete broadcast schedule"
  on public.broadcast_schedule;

create policy
  "Admins can delete broadcast schedule"
on public.broadcast_schedule
for delete
to authenticated
using ((select public.is_admin()));

commit;
