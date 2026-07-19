begin;

create extension if not exists pgcrypto;

create table if not exists public.tv_news (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  summary text not null,
  category text not null,
  source_name text null,
  source_url text null,
  image_url text null,
  is_breaking boolean not null default false,
  is_published boolean not null default false,
  published_at timestamptz null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint tv_news_title_valid
    check (length(btrim(title)) between 1 and 180),

  constraint tv_news_summary_valid
    check (length(btrim(summary)) between 1 and 1000),

  constraint tv_news_category_allowed
    check (
      category in (
        'National',
        'International',
        'Ndiagne & régions',
        'Culture',
        'Sport',
        'Urgent'
      )
    ),

  constraint tv_news_source_name_valid
    check (
      source_name is null
      or length(btrim(source_name)) between 1 and 160
    ),

  constraint tv_news_source_url_valid
    check (
      source_url is null
      or (
        length(source_url) <= 2048
        and source_url ~* '^https?://[^[:space:]]+$'
      )
    ),

  constraint tv_news_image_url_valid
    check (
      image_url is null
      or (
        length(image_url) <= 2048
        and image_url ~ '^https://yqgcsaxzpzrueepcomzr[.]supabase[.]co/storage/v1/object/public/[^[:space:]]+$'
      )
    )
);

create index if not exists tv_news_published_date_idx
  on public.tv_news (is_published, published_at desc);

create index if not exists tv_news_category_idx
  on public.tv_news (category);

create or replace function public.set_tv_news_timestamps()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $function$
begin
  new.updated_at := now();

  if new.is_published = true
     and new.published_at is null then
    new.published_at := now();
  end if;

  return new;
end;
$function$;

drop trigger if exists set_tv_news_timestamps
  on public.tv_news;

create trigger set_tv_news_timestamps
before insert or update
on public.tv_news
for each row
execute function public.set_tv_news_timestamps();

alter table public.tv_news enable row level security;

revoke execute on function public.is_admin() from public;
revoke execute on function public.is_admin() from anon;
grant execute on function public.is_admin() to authenticated;
grant execute on function public.is_admin() to service_role;

revoke all on table public.tv_news from public;
revoke all on table public.tv_news from anon;
revoke all on table public.tv_news from authenticated;

grant select
  on table public.tv_news
  to anon;

grant select, insert, update, delete
  on table public.tv_news
  to authenticated;

grant all
  on table public.tv_news
  to service_role;

drop policy if exists
  "Public can read published tv news"
  on public.tv_news;

create policy
  "Public can read published tv news"
on public.tv_news
for select
to anon, authenticated
using (is_published = true);

drop policy if exists
  "Admins can read all tv news"
  on public.tv_news;

create policy
  "Admins can read all tv news"
on public.tv_news
for select
to authenticated
using ((select public.is_admin()));

drop policy if exists
  "Admins can insert tv news"
  on public.tv_news;

create policy
  "Admins can insert tv news"
on public.tv_news
for insert
to authenticated
with check ((select public.is_admin()));

drop policy if exists
  "Admins can update tv news"
  on public.tv_news;

create policy
  "Admins can update tv news"
on public.tv_news
for update
to authenticated
using ((select public.is_admin()))
with check ((select public.is_admin()));

drop policy if exists
  "Admins can delete tv news"
  on public.tv_news;

create policy
  "Admins can delete tv news"
on public.tv_news
for delete
to authenticated
using ((select public.is_admin()));

do $block$
begin
  if not exists (
    select 1
    from pg_publication
    where pubname = 'supabase_realtime'
  ) then
    raise exception
      'Migration tv_news interrompue : la publication Supabase Realtime "supabase_realtime" est absente.';
  end if;

  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'tv_news'
  ) then
    execute
      'alter publication supabase_realtime add table public.tv_news';
  end if;
end;
$block$;

commit;
