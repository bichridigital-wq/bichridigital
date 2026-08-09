begin;

create table public.push_device_program_subscriptions (
  push_device_id uuid not null
    references public.push_devices(id) on delete cascade,
  program_id uuid not null
    references public.broadcast_programs(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (push_device_id, program_id)
);

create index push_program_subscriptions_program_device_idx
  on public.push_device_program_subscriptions (program_id, push_device_id);

alter table public.push_device_program_subscriptions enable row level security;
revoke all on table public.push_device_program_subscriptions
  from public, anon, authenticated;
grant select, insert, update, delete on table public.push_device_program_subscriptions
  to service_role;

insert into public.push_device_program_subscriptions (push_device_id, program_id)
select distinct device.id, program.id
from public.push_devices device
cross join lateral unnest(device.followed_emission_slugs) as followed(slug)
join public.broadcast_programs program on program.slug = followed.slug
on conflict (push_device_id, program_id) do nothing;

create or replace function public.sync_push_device_program_subscriptions(
  p_push_device_id uuid,
  p_followed_emission_slugs text[]
) returns void
language plpgsql security invoker set search_path = '' as $$
begin
  delete from public.push_device_program_subscriptions subscription
  where subscription.push_device_id = p_push_device_id
    and not exists (
      select 1
      from public.broadcast_programs program
      where program.id = subscription.program_id
        and program.is_active
        and program.slug = any(coalesce(p_followed_emission_slugs, '{}'::text[]))
    );

  insert into public.push_device_program_subscriptions (push_device_id, program_id)
  select p_push_device_id, program.id
  from public.broadcast_programs program
  where program.is_active
    and program.slug = any(coalesce(p_followed_emission_slugs, '{}'::text[]))
  on conflict (push_device_id, program_id) do nothing;
end;
$$;

revoke all on function public.sync_push_device_program_subscriptions(uuid, text[])
  from public, anon, authenticated;
grant execute on function public.sync_push_device_program_subscriptions(uuid, text[])
  to service_role;

create or replace function public.register_push_device(
  p_installation_id text, p_expo_push_token text,
  p_platform text, p_runtime_environment text, p_app_version text,
  p_device_name text, p_locale text, p_timezone text,
  p_notifications_enabled boolean, p_notify_new_videos boolean,
  p_notify_live_starts boolean, p_notify_followed_emissions boolean,
  p_followed_emission_slugs text[]
) returns table(device_id uuid, registration_status text)
language plpgsql security invoker set search_path = '' as $$
declare v_device_id uuid; v_status text; v_token_hash text;
begin
  v_token_hash := encode(
    extensions.digest(convert_to(p_expo_push_token, 'UTF8'), 'sha256'),
    'hex'
  );

  perform pg_advisory_xact_lock(hashtextextended('push_devices:register', 0));
  perform 1
  from public.push_devices
  where installation_id = p_installation_id
     or expo_push_token = p_expo_push_token
  order by id
  for update;

  update public.push_devices set
    expo_push_token = null, is_active = false,
    disabled_at = now(), disabled_reason = 'token_transferred'
  where expo_push_token = p_expo_push_token and installation_id <> p_installation_id;

  select id into v_device_id from public.push_devices
  where installation_id = p_installation_id for update;
  v_status := case when v_device_id is null then 'created' else 'updated' end;

  insert into public.push_devices (
    installation_id, expo_push_token, token_hash, token_last_four, platform,
    runtime_environment, app_version, device_name, locale, timezone,
    notifications_enabled, notify_new_videos, notify_live_starts,
    notify_followed_emissions, followed_emission_slugs, is_active,
    last_registered_at, last_seen_at, disabled_at, disabled_reason,
    last_delivery_error
  ) values (
    p_installation_id, p_expo_push_token, v_token_hash, right(p_expo_push_token, 4),
    p_platform, p_runtime_environment, p_app_version, p_device_name, p_locale,
    p_timezone, p_notifications_enabled, p_notify_new_videos,
    p_notify_live_starts, p_notify_followed_emissions,
    p_followed_emission_slugs, true, now(), now(), null, null, null
  ) on conflict (installation_id) do update set
    expo_push_token = excluded.expo_push_token,
    token_hash = excluded.token_hash,
    token_last_four = excluded.token_last_four,
    platform = excluded.platform,
    runtime_environment = excluded.runtime_environment,
    app_version = excluded.app_version,
    device_name = excluded.device_name,
    locale = excluded.locale,
    timezone = excluded.timezone,
    notifications_enabled = excluded.notifications_enabled,
    notify_new_videos = excluded.notify_new_videos,
    notify_live_starts = excluded.notify_live_starts,
    notify_followed_emissions = excluded.notify_followed_emissions,
    followed_emission_slugs = excluded.followed_emission_slugs,
    is_active = true, last_registered_at = now(), last_seen_at = now(),
    disabled_at = null, disabled_reason = null, last_delivery_error = null
  returning id into v_device_id;

  perform public.sync_push_device_program_subscriptions(
    v_device_id,
    p_followed_emission_slugs
  );
  return query select v_device_id, v_status;
end;
$$;

create or replace function public.update_push_device_preferences(
  p_installation_id text, p_token_hash text, p_notifications_enabled boolean,
  p_notify_new_videos boolean, p_notify_live_starts boolean,
  p_notify_followed_emissions boolean, p_followed_emission_slugs text[]
) returns boolean language plpgsql security invoker set search_path = '' as $$
declare v_device_id uuid;
begin
  update public.push_devices set
    notifications_enabled = p_notifications_enabled,
    notify_new_videos = p_notify_new_videos,
    notify_live_starts = p_notify_live_starts,
    notify_followed_emissions = p_notify_followed_emissions,
    followed_emission_slugs = p_followed_emission_slugs,
    last_seen_at = now()
  where installation_id = p_installation_id and token_hash = p_token_hash and is_active
  returning id into v_device_id;

  if v_device_id is null then return false; end if;
  perform public.sync_push_device_program_subscriptions(
    v_device_id,
    p_followed_emission_slugs
  );
  return true;
end;
$$;

create or replace function public.follow_push_device_program(
  p_installation_id text,
  p_token_hash text,
  p_program_id uuid,
  p_limit integer default 100
) returns text language plpgsql security invoker set search_path = '' as $$
declare v_device_id uuid; v_program_slug text;
begin
  select id into v_device_id
  from public.push_devices
  where installation_id = p_installation_id
    and token_hash = p_token_hash
    and is_active
  for update;
  if v_device_id is null then return 'ownership_mismatch'; end if;

  select slug into v_program_slug
  from public.broadcast_programs
  where id = p_program_id and is_active;
  if v_program_slug is null then return 'program_unavailable'; end if;

  if not exists (
    select 1 from public.push_device_program_subscriptions
    where push_device_id = v_device_id and program_id = p_program_id
  ) and (
    select count(*) from public.push_device_program_subscriptions
    where push_device_id = v_device_id
  ) >= p_limit then
    return 'limit_reached';
  end if;

  insert into public.push_device_program_subscriptions (push_device_id, program_id)
  values (v_device_id, p_program_id)
  on conflict (push_device_id, program_id) do nothing;

  update public.push_devices
  set followed_emission_slugs = array(
    select distinct slug
    from unnest(followed_emission_slugs || array[v_program_slug]) as legacy(slug)
    order by slug
  ), last_seen_at = now()
  where id = v_device_id;
  return 'followed';
end;
$$;

create or replace function public.unfollow_push_device_program(
  p_installation_id text,
  p_token_hash text,
  p_program_id uuid
) returns text language plpgsql security invoker set search_path = '' as $$
declare v_device_id uuid; v_program_slug text;
begin
  select id into v_device_id
  from public.push_devices
  where installation_id = p_installation_id
    and token_hash = p_token_hash
    and is_active
  for update;
  if v_device_id is null then return 'ownership_mismatch'; end if;

  select slug into v_program_slug
  from public.broadcast_programs
  where id = p_program_id;
  if v_program_slug is null then return 'program_unavailable'; end if;

  delete from public.push_device_program_subscriptions
  where push_device_id = v_device_id and program_id = p_program_id;
  update public.push_devices
  set followed_emission_slugs = array_remove(followed_emission_slugs, v_program_slug),
      last_seen_at = now()
  where id = v_device_id;
  return 'unfollowed';
end;
$$;

revoke all on function public.follow_push_device_program(text, text, uuid, integer)
  from public, anon, authenticated;
revoke all on function public.unfollow_push_device_program(text, text, uuid)
  from public, anon, authenticated;
grant execute on function public.follow_push_device_program(text, text, uuid, integer)
  to service_role;
grant execute on function public.unfollow_push_device_program(text, text, uuid)
  to service_role;

alter table public.push_rate_limits
  drop constraint push_rate_endpoint_valid,
  add constraint push_rate_endpoint_valid check (endpoint in (
    'register', 'preferences', 'unregister',
    'program_subscriptions_list',
    'program_subscriptions_follow',
    'program_subscriptions_unfollow'
  ));

commit;
