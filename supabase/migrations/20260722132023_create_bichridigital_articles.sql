begin;

create extension if not exists pgcrypto;

create table if not exists public.bichridigital_articles (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  excerpt text not null,
  content text not null,
  category text not null,
  author_name text not null default 'Bichridigital Agency',
  cover_storage_path text,
  seo_title text,
  seo_description text,
  is_featured boolean not null default false,
  is_published boolean not null default false,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint bichridigital_articles_title_valid check (length(btrim(title)) between 10 and 120),
  constraint bichridigital_articles_slug_valid check (length(slug) between 3 and 140 and slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  constraint bichridigital_articles_excerpt_valid check (length(btrim(excerpt)) between 80 and 300),
  constraint bichridigital_articles_content_valid check (length(btrim(content)) >= 600),
  constraint bichridigital_articles_category_allowed check (category in ('communication-digitale','audiovisuel-streaming','photographie','design-graphique','web-seo','coulisses-bichridigital')),
  constraint bichridigital_articles_author_valid check (length(btrim(author_name)) between 1 and 120),
  constraint bichridigital_articles_cover_path_valid check (cover_storage_path is null or cover_storage_path ~ '^articles/[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89aAbB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}/[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89aAbB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}-[A-Za-z0-9][A-Za-z0-9._-]*$'),
  constraint bichridigital_articles_seo_title_valid check (seo_title is null or length(btrim(seo_title)) between 1 and 60),
  constraint bichridigital_articles_seo_description_valid check (seo_description is null or length(btrim(seo_description)) between 120 and 160)
);

create index if not exists bichridigital_articles_slug_idx on public.bichridigital_articles (slug);
create index if not exists bichridigital_articles_published_idx on public.bichridigital_articles (is_published);
create index if not exists bichridigital_articles_published_at_idx on public.bichridigital_articles (published_at desc);
create index if not exists bichridigital_articles_category_idx on public.bichridigital_articles (category);
create index if not exists bichridigital_articles_featured_idx on public.bichridigital_articles (is_featured);

create or replace function public.set_bichridigital_article_timestamps()
returns trigger language plpgsql security invoker set search_path = '' as $function$
begin
  new.updated_at := now();
  if tg_op = 'INSERT' then
    new.created_at := now();
    new.published_at := case when new.is_published then now() else null end;
  elsif new.is_published and not old.is_published and old.published_at is null then
    new.published_at := now();
  else
    new.published_at := old.published_at;
  end if;
  return new;
end;
$function$;

drop trigger if exists set_bichridigital_article_timestamps on public.bichridigital_articles;
create trigger set_bichridigital_article_timestamps before insert or update on public.bichridigital_articles
for each row execute function public.set_bichridigital_article_timestamps();

alter table public.bichridigital_articles enable row level security;
revoke all on public.bichridigital_articles from public, anon, authenticated;
grant select on public.bichridigital_articles to anon;
grant select, insert, update, delete on public.bichridigital_articles to authenticated;
grant all on public.bichridigital_articles to service_role;

drop policy if exists "Public can read published bichridigital articles" on public.bichridigital_articles;
create policy "Public can read published bichridigital articles" on public.bichridigital_articles for select to anon, authenticated using (is_published = true);
drop policy if exists "Admins can read all bichridigital articles" on public.bichridigital_articles;
create policy "Admins can read all bichridigital articles" on public.bichridigital_articles for select to authenticated using ((select public.is_admin()));
drop policy if exists "Admins can insert bichridigital articles" on public.bichridigital_articles;
create policy "Admins can insert bichridigital articles" on public.bichridigital_articles for insert to authenticated with check ((select public.is_admin()));
drop policy if exists "Admins can update bichridigital articles" on public.bichridigital_articles;
create policy "Admins can update bichridigital articles" on public.bichridigital_articles for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
drop policy if exists "Admins can delete bichridigital articles" on public.bichridigital_articles;
create policy "Admins can delete bichridigital articles" on public.bichridigital_articles for delete to authenticated using ((select public.is_admin()));

insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
values ('bichridigital-article-media','bichridigital-article-media',false,8388608,array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set public=false,file_size_limit=excluded.file_size_limit,allowed_mime_types=excluded.allowed_mime_types;

drop policy if exists "Admins can read article media objects" on storage.objects;
create policy "Admins can read article media objects" on storage.objects for select to authenticated using (bucket_id='bichridigital-article-media' and (select public.is_admin()));
drop policy if exists "Admins can upload article media objects" on storage.objects;
create policy "Admins can upload article media objects" on storage.objects for insert to authenticated with check (bucket_id='bichridigital-article-media' and (select public.is_admin()) and name ~ '^articles/[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89aAbB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}/[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89aAbB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}-[A-Za-z0-9][A-Za-z0-9._-]*$');
drop policy if exists "Admins can update article media objects" on storage.objects;
create policy "Admins can update article media objects" on storage.objects for update to authenticated using (bucket_id='bichridigital-article-media' and (select public.is_admin())) with check (bucket_id='bichridigital-article-media' and (select public.is_admin()) and name ~ '^articles/[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89aAbB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}/[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89aAbB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}-[A-Za-z0-9][A-Za-z0-9._-]*$');
drop policy if exists "Admins can delete article media objects" on storage.objects;
create policy "Admins can delete article media objects" on storage.objects for delete to authenticated using (bucket_id='bichridigital-article-media' and (select public.is_admin()));

commit;
