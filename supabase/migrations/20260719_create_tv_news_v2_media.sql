begin;

create table if not exists public.tv_news_media (
  id uuid primary key default gen_random_uuid(),
  news_id uuid not null
    references public.tv_news(id)
    on delete cascade,
  media_type text not null,
  storage_path text null,
  external_url text null,
  file_name text not null,
  mime_type text null,
  file_size bigint null,
  title text null,
  alt_text text null,
  sort_order integer not null default 0,
  is_cover boolean not null default false,
  created_at timestamptz not null default now(),

  constraint tv_news_media_type_allowed
    check (
      media_type in ('image', 'pdf', 'audio', 'video', 'youtube')
    ),

  constraint tv_news_media_exactly_one_location
    check (num_nonnulls(storage_path, external_url) = 1),

  constraint tv_news_media_storage_path_valid
    check (
      storage_path is null
      or (
        storage_path like 'news/' || news_id::text || '/%'
        and storage_path ~
          '^news/[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89aAbB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}/[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89aAbB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}-[A-Za-z0-9][A-Za-z0-9._-]*$'
      )
    ),

  constraint tv_news_media_external_url_valid
    check (
      external_url is null
      or (
        length(external_url) <= 2048
        and external_url ~* '^https?://[^[:space:]]+$'
      )
    ),

  constraint tv_news_media_file_name_valid
    check (length(btrim(file_name)) between 1 and 255),

  constraint tv_news_media_file_size_valid
    check (file_size is null or file_size >= 0),

  constraint tv_news_media_title_valid
    check (
      title is null
      or length(btrim(title)) between 1 and 180
    ),

  constraint tv_news_media_alt_text_valid
    check (
      alt_text is null
      or length(btrim(alt_text)) between 1 and 300
    ),

  constraint tv_news_media_sort_order_valid
    check (sort_order >= 0),

  constraint tv_news_media_youtube_valid
    check (
      media_type <> 'youtube'
      or (
        storage_path is null
        and external_url is not null
        and external_url ~*
          '^https?://(www[.])?(youtube[.]com|youtu[.]be)(/|$)'
      )
    ),

  constraint tv_news_media_uploaded_file_valid
    check (
      media_type = 'youtube'
      or (
        storage_path is not null
        and external_url is null
        and mime_type is not null
        and file_size is not null
      )
    ),

  constraint tv_news_media_mime_matches_type
    check (
      media_type = 'youtube'
      or (media_type = 'image' and mime_type in (
        'image/jpeg', 'image/png', 'image/webp'
      ))
      or (media_type = 'pdf' and mime_type = 'application/pdf')
      or (media_type = 'audio' and mime_type in (
        'audio/mpeg', 'audio/mp4'
      ))
      or (media_type = 'video' and mime_type in (
        'video/mp4', 'video/webm'
      ))
    ),

  constraint tv_news_media_size_matches_type
    check (
      media_type = 'youtube'
      or (media_type = 'image' and file_size <= 8388608)
      or (media_type = 'pdf' and file_size <= 20971520)
      or (media_type = 'audio' and file_size <= 20971520)
      or (media_type = 'video' and file_size <= 52428800)
    )
);

create index if not exists tv_news_media_news_order_idx
  on public.tv_news_media (news_id, sort_order, created_at);

create index if not exists tv_news_media_type_idx
  on public.tv_news_media (media_type);

create unique index if not exists tv_news_media_one_cover_idx
  on public.tv_news_media (news_id)
  where is_cover = true;

alter table public.tv_news_media enable row level security;

revoke all on table public.tv_news_media from public;
revoke all on table public.tv_news_media from anon;
revoke all on table public.tv_news_media from authenticated;

grant select on table public.tv_news_media to anon;
grant select, insert, update, delete
  on table public.tv_news_media
  to authenticated;
grant all on table public.tv_news_media to service_role;

drop policy if exists
  "Public can read media of published tv news"
  on public.tv_news_media;

create policy
  "Public can read media of published tv news"
on public.tv_news_media
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.tv_news
    where tv_news.id = tv_news_media.news_id
      and tv_news.is_published = true
  )
);

drop policy if exists
  "Admins can read all tv news media"
  on public.tv_news_media;

create policy
  "Admins can read all tv news media"
on public.tv_news_media
for select
to authenticated
using ((select public.is_admin()));

drop policy if exists
  "Admins can insert tv news media"
  on public.tv_news_media;

create policy
  "Admins can insert tv news media"
on public.tv_news_media
for insert
to authenticated
with check ((select public.is_admin()));

drop policy if exists
  "Admins can update tv news media"
  on public.tv_news_media;

create policy
  "Admins can update tv news media"
on public.tv_news_media
for update
to authenticated
using ((select public.is_admin()))
with check ((select public.is_admin()));

drop policy if exists
  "Admins can delete tv news media"
  on public.tv_news_media;

create policy
  "Admins can delete tv news media"
on public.tv_news_media
for delete
to authenticated
using ((select public.is_admin()));

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'tv-news-media',
  'tv-news-media',
  true,
  52428800,
  array[
    'image/jpeg',
    'image/png',
    'image/webp',
    'application/pdf',
    'audio/mpeg',
    'audio/mp4',
    'video/mp4',
    'video/webm'
  ]
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists
  "Public can read tv news media objects"
  on storage.objects;

create policy
  "Public can read tv news media objects"
on storage.objects
for select
to anon, authenticated
using (bucket_id = 'tv-news-media');

drop policy if exists
  "Admins can upload tv news media objects"
  on storage.objects;

create policy
  "Admins can upload tv news media objects"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'tv-news-media'
  and (select public.is_admin())
  and name ~
    '^news/[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89aAbB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}/[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89aAbB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}-[A-Za-z0-9][A-Za-z0-9._-]*$'
);

drop policy if exists
  "Admins can update tv news media objects"
  on storage.objects;

create policy
  "Admins can update tv news media objects"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'tv-news-media'
  and (select public.is_admin())
)
with check (
  bucket_id = 'tv-news-media'
  and (select public.is_admin())
  and name ~
    '^news/[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89aAbB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}/[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89aAbB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}-[A-Za-z0-9][A-Za-z0-9._-]*$'
);

drop policy if exists
  "Admins can delete tv news media objects"
  on storage.objects;

create policy
  "Admins can delete tv news media objects"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'tv-news-media'
  and (select public.is_admin())
);

commit;
