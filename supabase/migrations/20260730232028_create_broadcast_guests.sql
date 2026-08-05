begin;

create table if not exists public.broadcast_guests (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  slug text not null,
  title text null,
  short_bio text null,
  specialty text null,
  photo_url text null,
  photo_storage_path text null,
  instagram_url text null,
  facebook_url text null,
  youtube_url text null,
  website_url text null,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint broadcast_guests_full_name_valid
    check (length(btrim(full_name)) between 1 and 180),
  constraint broadcast_guests_slug_valid
    check (
      length(slug) between 1 and 140
      and slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'
    ),
  constraint broadcast_guests_title_valid
    check (title is null or length(btrim(title)) between 1 and 180),
  constraint broadcast_guests_short_bio_valid
    check (short_bio is null or length(btrim(short_bio)) between 1 and 3000),
  constraint broadcast_guests_specialty_valid
    check (specialty is null or length(btrim(specialty)) between 1 and 180),
  constraint broadcast_guests_sort_order_valid
    check (sort_order >= 0),
  constraint broadcast_guests_photo_pair_valid
    check (
      (photo_url is null and photo_storage_path is null)
      or (
        photo_url is not null
        and photo_storage_path is not null
        and photo_storage_path ~ (
          '^guests/' || id::text ||
          '/[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89aAbB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}[.](jpg|png|webp)$'
        )
      )
    ),
  constraint broadcast_guests_photo_url_valid
    check (photo_url is null or (length(photo_url) <= 2048 and photo_url ~* '^https?://[^[:space:]]+$')),
  constraint broadcast_guests_instagram_url_valid
    check (instagram_url is null or (length(instagram_url) <= 2048 and instagram_url ~* '^https?://[^[:space:]]+$')),
  constraint broadcast_guests_facebook_url_valid
    check (facebook_url is null or (length(facebook_url) <= 2048 and facebook_url ~* '^https?://[^[:space:]]+$')),
  constraint broadcast_guests_youtube_url_valid
    check (youtube_url is null or (length(youtube_url) <= 2048 and youtube_url ~* '^https?://[^[:space:]]+$')),
  constraint broadcast_guests_website_url_valid
    check (website_url is null or (length(website_url) <= 2048 and website_url ~* '^https?://[^[:space:]]+$'))
);

create unique index if not exists broadcast_guests_slug_unique_idx
  on public.broadcast_guests (slug);
create index if not exists broadcast_guests_active_order_name_idx
  on public.broadcast_guests (is_active, sort_order, full_name);

create or replace function public.set_broadcast_guests_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $function$
begin
  new.full_name := btrim(new.full_name);
  new.slug := lower(btrim(new.slug));
  new.title := nullif(btrim(new.title), '');
  new.short_bio := nullif(btrim(new.short_bio), '');
  new.specialty := nullif(btrim(new.specialty), '');
  new.instagram_url := nullif(btrim(new.instagram_url), '');
  new.facebook_url := nullif(btrim(new.facebook_url), '');
  new.youtube_url := nullif(btrim(new.youtube_url), '');
  new.website_url := nullif(btrim(new.website_url), '');
  new.updated_at := now();
  return new;
end;
$function$;

drop trigger if exists set_broadcast_guests_updated_at
  on public.broadcast_guests;
create trigger set_broadcast_guests_updated_at
before insert or update on public.broadcast_guests
for each row execute function public.set_broadcast_guests_updated_at();

create table if not exists public.broadcast_schedule_guests (
  id uuid primary key default gen_random_uuid(),
  schedule_id uuid not null
    references public.broadcast_schedule(id) on delete cascade,
  guest_id uuid null
    references public.broadcast_guests(id) on delete set null,
  guest_name_snapshot text not null,
  guest_title_snapshot text null,
  guest_photo_url_snapshot text null,
  role_label text null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),

  constraint broadcast_schedule_guests_name_valid
    check (length(btrim(guest_name_snapshot)) between 1 and 180),
  constraint broadcast_schedule_guests_title_valid
    check (guest_title_snapshot is null or length(btrim(guest_title_snapshot)) between 1 and 180),
  constraint broadcast_schedule_guests_photo_url_valid
    check (guest_photo_url_snapshot is null or (length(guest_photo_url_snapshot) <= 2048 and guest_photo_url_snapshot ~* '^https?://[^[:space:]]+$')),
  constraint broadcast_schedule_guests_role_valid
    check (role_label is null or length(btrim(role_label)) between 1 and 120),
  constraint broadcast_schedule_guests_sort_order_valid
    check (sort_order >= 0)
);

create unique index if not exists broadcast_schedule_guests_unique_guest_idx
  on public.broadcast_schedule_guests (schedule_id, guest_id)
  where guest_id is not null;
create index if not exists broadcast_schedule_guests_schedule_idx
  on public.broadcast_schedule_guests (schedule_id);
create index if not exists broadcast_schedule_guests_guest_idx
  on public.broadcast_schedule_guests (guest_id);
create index if not exists broadcast_schedule_guests_schedule_order_idx
  on public.broadcast_schedule_guests (schedule_id, sort_order);

alter table public.broadcast_guests enable row level security;
alter table public.broadcast_schedule_guests enable row level security;

revoke all on table public.broadcast_guests from public, anon, authenticated;
revoke all on table public.broadcast_schedule_guests from public, anon, authenticated;
grant select, insert, update, delete on table public.broadcast_guests to authenticated;
grant select, insert, update, delete on table public.broadcast_schedule_guests to authenticated;
grant all on table public.broadcast_guests to service_role;
grant all on table public.broadcast_schedule_guests to service_role;

drop policy if exists "Admins can read broadcast guests"
  on public.broadcast_guests;
create policy "Admins can read broadcast guests"
on public.broadcast_guests for select to authenticated
using ((select public.is_admin()));
drop policy if exists "Admins can insert broadcast guests"
  on public.broadcast_guests;
create policy "Admins can insert broadcast guests"
on public.broadcast_guests for insert to authenticated
with check ((select public.is_admin()));
drop policy if exists "Admins can update broadcast guests"
  on public.broadcast_guests;
create policy "Admins can update broadcast guests"
on public.broadcast_guests for update to authenticated
using ((select public.is_admin()))
with check ((select public.is_admin()));
drop policy if exists "Admins can delete broadcast guests"
  on public.broadcast_guests;
create policy "Admins can delete broadcast guests"
on public.broadcast_guests for delete to authenticated
using ((select public.is_admin()));

drop policy if exists "Admins can read schedule guests"
  on public.broadcast_schedule_guests;
create policy "Admins can read schedule guests"
on public.broadcast_schedule_guests for select to authenticated
using ((select public.is_admin()));
drop policy if exists "Admins can insert schedule guests"
  on public.broadcast_schedule_guests;
create policy "Admins can insert schedule guests"
on public.broadcast_schedule_guests for insert to authenticated
with check ((select public.is_admin()));
drop policy if exists "Admins can update schedule guests"
  on public.broadcast_schedule_guests;
create policy "Admins can update schedule guests"
on public.broadcast_schedule_guests for update to authenticated
using ((select public.is_admin()))
with check ((select public.is_admin()));
drop policy if exists "Admins can delete schedule guests"
  on public.broadcast_schedule_guests;
create policy "Admins can delete schedule guests"
on public.broadcast_schedule_guests for delete to authenticated
using ((select public.is_admin()));

create or replace function public.sync_broadcast_schedule_guests(
  p_schedule_id uuid,
  p_guests jsonb
)
returns void
language plpgsql
security invoker
set search_path = ''
as $function$
declare
  requested_count integer;
  item jsonb;
  item_position integer;
  guest_id_text text;
  association_id_text text;
  sort_order_text text;
  refresh_snapshot boolean;
  selected_guest public.broadcast_guests%rowtype;
  existing_association public.broadcast_schedule_guests%rowtype;
  seen_guest_ids uuid[] := array[]::uuid[];
  seen_association_ids uuid[] := array[]::uuid[];
  normalized_guests jsonb := '[]'::jsonb;
begin
  if coalesce((select public.is_admin()), false) is not true then
    raise exception 'Administrator access required' using errcode = '42501';
  end if;
  if not exists (
    select 1 from public.broadcast_schedule where id = p_schedule_id
  ) then
    raise exception 'Schedule event not found' using errcode = 'P0002';
  end if;
  if p_guests is null or jsonb_typeof(p_guests) <> 'array' then
    raise exception 'Guests must be a JSON array' using errcode = '22023';
  end if;
  requested_count := jsonb_array_length(p_guests);
  if requested_count > 50 then
    raise exception 'Too many guests' using errcode = '22023';
  end if;

  for item, item_position in
    select source.item, source.position::integer
    from jsonb_array_elements(p_guests)
      with ordinality source(item, position)
    order by source.position
  loop
    if jsonb_typeof(item) <> 'object' then
      raise exception 'Each guest selection must be a JSON object'
        using errcode = '22023';
    end if;

    guest_id_text := nullif(item->>'guest_id', '');
    association_id_text := nullif(item->>'association_id', '');
    sort_order_text := item->>'sort_order';

    if guest_id_text is not null and guest_id_text !~
      '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89aAbB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$'
    then
      raise exception 'Invalid guest_id at position %', item_position - 1
        using errcode = '22023';
    end if;
    if association_id_text is not null and association_id_text !~
      '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89aAbB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$'
    then
      raise exception 'Invalid association_id at position %', item_position - 1
        using errcode = '22023';
    end if;
    if not (item ? 'sort_order')
      or jsonb_typeof(item->'sort_order') is distinct from 'number'
      or sort_order_text !~ '^(0|[1-9][0-9]*)$'
      or length(sort_order_text) > 10
      or sort_order_text::numeric > 2147483647
    then
      raise exception 'Invalid sort_order at position %', item_position - 1
        using errcode = '22023';
    end if;
    if item ? 'refresh_snapshot'
      and jsonb_typeof(item->'refresh_snapshot') <> 'boolean'
    then
      raise exception 'Invalid refresh_snapshot at position %', item_position - 1
        using errcode = '22023';
    end if;
    if item ? 'role_label'
      and jsonb_typeof(item->'role_label') not in ('string', 'null')
    then
      raise exception 'Invalid role_label at position %', item_position - 1
        using errcode = '22023';
    end if;
    if length(coalesce(btrim(item->>'role_label'), '')) > 120 then
      raise exception 'role_label is too long at position %', item_position - 1
        using errcode = '22023';
    end if;

    refresh_snapshot := coalesce((item->>'refresh_snapshot')::boolean, false);
    selected_guest := null;
    existing_association := null;

    if association_id_text is not null then
      if association_id_text::uuid = any(seen_association_ids) then
        raise exception 'Duplicate association_id at position %', item_position - 1
          using errcode = '22023';
      end if;
      seen_association_ids :=
        array_append(seen_association_ids, association_id_text::uuid);

      select association.*
      into existing_association
      from public.broadcast_schedule_guests association
      where association.id = association_id_text::uuid
        and association.schedule_id = p_schedule_id;

      if existing_association.id is null then
        raise exception 'Association not found for this schedule at position %',
          item_position - 1 using errcode = '22023';
      end if;
      if existing_association.guest_id is null and guest_id_text is not null then
        raise exception 'A historical association cannot be assigned to another guest'
          using errcode = '22023';
      end if;
      if existing_association.guest_id is null and refresh_snapshot then
        raise exception 'A historical association cannot refresh its snapshot'
          using errcode = '22023';
      end if;
      if existing_association.guest_id is not null and (
        guest_id_text is null
        or existing_association.guest_id <> guest_id_text::uuid
      ) then
        raise exception 'association_id and guest_id do not match at position %',
          item_position - 1 using errcode = '22023';
      end if;
    elsif guest_id_text is null then
      raise exception 'association_id is required for a historical guest at position %',
        item_position - 1 using errcode = '22023';
    end if;

    if guest_id_text is not null then
      if guest_id_text::uuid = any(seen_guest_ids) then
        raise exception 'Duplicate guest_id at position %', item_position - 1
          using errcode = '22023';
      end if;
      seen_guest_ids := array_append(seen_guest_ids, guest_id_text::uuid);

      select guest.*
      into selected_guest
      from public.broadcast_guests guest
      where guest.id = guest_id_text::uuid;

      if selected_guest.id is null then
        raise exception 'Guest not found or inaccessible at position %',
          item_position - 1 using errcode = '22023';
      end if;
    end if;

    normalized_guests := normalized_guests || jsonb_build_array(
      jsonb_build_object(
        'guest_id', selected_guest.id,
        'guest_name_snapshot',
          case
            when existing_association.id is null or refresh_snapshot
              then selected_guest.full_name
            else existing_association.guest_name_snapshot
          end,
        'guest_title_snapshot',
          case
            when existing_association.id is null or refresh_snapshot
              then selected_guest.title
            else existing_association.guest_title_snapshot
          end,
        'guest_photo_url_snapshot',
          case
            when existing_association.id is null or refresh_snapshot
              then selected_guest.photo_url
            else existing_association.guest_photo_url_snapshot
          end,
        'role_label', nullif(btrim(item->>'role_label'), ''),
        'sort_order', sort_order_text::integer
      )
    );
  end loop;

  delete from public.broadcast_schedule_guests
  where schedule_id = p_schedule_id;

  insert into public.broadcast_schedule_guests (
    schedule_id,
    guest_id,
    guest_name_snapshot,
    guest_title_snapshot,
    guest_photo_url_snapshot,
    role_label,
    sort_order
  )
  select
    p_schedule_id,
    normalized.guest_id,
    normalized.guest_name_snapshot,
    normalized.guest_title_snapshot,
    normalized.guest_photo_url_snapshot,
    normalized.role_label,
    normalized.sort_order
  from jsonb_to_recordset(normalized_guests) as normalized (
    guest_id uuid,
    guest_name_snapshot text,
    guest_title_snapshot text,
    guest_photo_url_snapshot text,
    role_label text,
    sort_order integer
  )
  order by normalized.sort_order;
end;
$function$;

revoke all on function public.sync_broadcast_schedule_guests(uuid, jsonb)
  from public, anon;
grant execute on function public.sync_broadcast_schedule_guests(uuid, jsonb)
  to authenticated, service_role;

commit;
