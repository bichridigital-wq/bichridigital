begin;

create extension if not exists pgcrypto with schema extensions;

create or replace function public.text_array_is_unique_slugs(values_to_check text[])
returns boolean language sql immutable security invoker set search_path = '' as $$
  select coalesce(
    cardinality(values_to_check) = (
      select count(distinct value)
      from unnest(values_to_check) value
      where value ~ '^[a-z0-9]+(-[a-z0-9]+)*$'
    )
    and not exists (
      select 1 from unnest(values_to_check) value
      where value !~ '^[a-z0-9]+(-[a-z0-9]+)*$'
    ), false
  );
$$;

create table public.push_devices (
  id uuid primary key default gen_random_uuid(),
  installation_id text not null,
  expo_push_token text null,
  token_hash text null,
  token_last_four text null,
  platform text not null,
  runtime_environment text not null,
  app_version text null,
  device_name text null,
  locale text null,
  timezone text null,
  notifications_enabled boolean not null default true,
  notify_new_videos boolean not null default true,
  notify_live_starts boolean not null default true,
  notify_followed_emissions boolean not null default true,
  followed_emission_slugs text[] not null default '{}',
  is_active boolean not null default true,
  last_registered_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  disabled_at timestamptz null,
  disabled_reason text null,
  last_delivery_error text null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint push_devices_installation_unique unique (installation_id),
  constraint push_devices_installation_valid check (
    installation_id ~ '^install_[a-z0-9]+_[a-z0-9]{8,160}$'
    and length(installation_id) <= 220
  ),
  constraint push_devices_platform_valid check (platform in ('ios', 'android')),
  constraint push_devices_runtime_valid check (
    runtime_environment in ('development-build', 'production')
  ),
  constraint push_devices_token_valid check (
    (is_active and expo_push_token is not null and token_hash is not null)
    or (not is_active and expo_push_token is null)
  ),
  constraint push_devices_token_metadata_valid check (
    (expo_push_token is null or (
      length(expo_push_token) between 20 and 255
      and token_hash is not null
      and token_last_four is not null
      and token_last_four = right(expo_push_token, 4)
      and token_hash = encode(
        extensions.digest(convert_to(expo_push_token, 'UTF8'), 'sha256'),
        'hex'
      )
    ))
    and (token_last_four is null or token_last_four ~ '^.{4}$')
    and (token_hash is null or token_hash ~ '^[0-9a-f]{64}$')
  ),
  constraint push_devices_metadata_lengths check (
    (app_version is null or length(app_version) <= 40)
    and (device_name is null or length(device_name) <= 160)
    and (locale is null or length(locale) <= 35)
    and (timezone is null or length(timezone) <= 100)
    and (disabled_reason is null or length(disabled_reason) <= 120)
    and (last_delivery_error is null or length(last_delivery_error) <= 500)
  ),
  constraint push_devices_followed_limit check (
    cardinality(followed_emission_slugs) <= 100
  ),
  constraint push_devices_followed_valid check (
    public.text_array_is_unique_slugs(followed_emission_slugs)
  )
);

create unique index push_devices_token_unique_idx
  on public.push_devices (expo_push_token) where expo_push_token is not null;
create index push_devices_active_idx on public.push_devices (is_active);
create index push_devices_platform_idx on public.push_devices (platform);
create index push_devices_notifications_idx on public.push_devices (notifications_enabled);
create index push_devices_last_seen_idx on public.push_devices (last_seen_at desc);

create table public.push_notification_batches (
  id uuid primary key default gen_random_uuid(),
  request_key uuid not null unique,
  notification_type text not null,
  title text not null,
  body text not null,
  data jsonb not null default '{}',
  audience_type text not null default 'single_device',
  requested_by uuid null references auth.users(id) on delete set null,
  status text not null default 'pending',
  requested_count integer not null default 0,
  accepted_count integer not null default 0,
  failed_count integer not null default 0,
  created_at timestamptz not null default now(),
  started_at timestamptz null,
  completed_at timestamptz null,
  error_message text null,
  constraint push_batches_type_valid check (notification_type = 'manual_test'),
  constraint push_batches_audience_valid check (audience_type = 'single_device'),
  constraint push_batches_status_valid check (status in ('pending', 'sending', 'completed', 'failed')),
  constraint push_batches_content_valid check (
    length(btrim(title)) between 1 and 100
    and length(btrim(body)) between 1 and 500
    and jsonb_typeof(data) = 'object'
    and octet_length(data::text) <= 3072
  ),
  constraint push_batches_counts_valid check (
    requested_count >= 0 and accepted_count >= 0 and failed_count >= 0
    and accepted_count + failed_count <= requested_count
  ),
  constraint push_batches_error_valid check (error_message is null or length(error_message) <= 500)
);

create index push_batches_created_idx on public.push_notification_batches (created_at desc);
create index push_batches_status_idx on public.push_notification_batches (status);

create table public.push_notification_deliveries (
  id uuid primary key default gen_random_uuid(),
  batch_id uuid not null references public.push_notification_batches(id) on delete cascade,
  device_id uuid null references public.push_devices(id) on delete set null,
  token_last_four text null,
  expo_ticket_id text null,
  ticket_status text null,
  ticket_error_code text null,
  ticket_error_message text null,
  receipt_status text null,
  receipt_error_code text null,
  receipt_error_message text null,
  attempts integer not null default 0,
  sent_at timestamptz null,
  receipt_checked_at timestamptz null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint push_deliveries_last_four_valid check (token_last_four is null or token_last_four ~ '^.{4}$'),
  constraint push_deliveries_ticket_status_valid check (ticket_status is null or ticket_status in ('ok', 'error')),
  constraint push_deliveries_receipt_status_valid check (receipt_status is null or receipt_status in ('ok', 'error')),
  constraint push_deliveries_attempts_valid check (attempts between 0 and 3),
  constraint push_deliveries_error_lengths check (
    (ticket_error_code is null or length(ticket_error_code) <= 80)
    and (ticket_error_message is null or length(ticket_error_message) <= 500)
    and (receipt_error_code is null or length(receipt_error_code) <= 80)
    and (receipt_error_message is null or length(receipt_error_message) <= 500)
  )
);

create unique index push_deliveries_ticket_unique_idx
  on public.push_notification_deliveries (expo_ticket_id) where expo_ticket_id is not null;
create index push_deliveries_batch_idx on public.push_notification_deliveries (batch_id);
create index push_deliveries_pending_receipt_idx
  on public.push_notification_deliveries (sent_at)
  where expo_ticket_id is not null and receipt_status is null;

create table public.push_rate_limits (
  key_hash text not null,
  endpoint text not null,
  window_started_at timestamptz not null,
  request_count integer not null default 1,
  expires_at timestamptz not null,
  primary key (key_hash, endpoint),
  constraint push_rate_key_valid check (key_hash ~ '^[0-9a-f]{64}$'),
  constraint push_rate_endpoint_valid check (endpoint in ('register', 'preferences', 'unregister')),
  constraint push_rate_count_valid check (request_count > 0)
);
create index push_rate_expiry_idx on public.push_rate_limits (expires_at);

create or replace function public.set_push_updated_at()
returns trigger language plpgsql security invoker set search_path = '' as $$
begin new.updated_at := now(); return new; end;
$$;

create trigger set_push_devices_updated_at before update on public.push_devices
for each row execute function public.set_push_updated_at();
create trigger set_push_deliveries_updated_at before update on public.push_notification_deliveries
for each row execute function public.set_push_updated_at();

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

  -- Registration is deliberately serialized before taking row locks. This
  -- prevents two simultaneous token swaps from locking the two device rows in
  -- opposite orders. Every affected row is then locked in stable UUID order.
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
  return query select v_device_id, v_status;
end;
$$;

create or replace function public.update_push_device_preferences(
  p_installation_id text, p_token_hash text, p_notifications_enabled boolean,
  p_notify_new_videos boolean, p_notify_live_starts boolean,
  p_notify_followed_emissions boolean, p_followed_emission_slugs text[]
) returns boolean language plpgsql security invoker set search_path = '' as $$
begin
  update public.push_devices set
    notifications_enabled = p_notifications_enabled,
    notify_new_videos = p_notify_new_videos,
    notify_live_starts = p_notify_live_starts,
    notify_followed_emissions = p_notify_followed_emissions,
    followed_emission_slugs = p_followed_emission_slugs,
    last_seen_at = now()
  where installation_id = p_installation_id and token_hash = p_token_hash and is_active;
  return found;
end;
$$;

create or replace function public.unregister_push_device(
  p_installation_id text, p_token_hash text
) returns boolean language plpgsql security invoker set search_path = '' as $$
declare v_exists boolean;
begin
  select exists(select 1 from public.push_devices
    where installation_id = p_installation_id and token_hash = p_token_hash)
  into v_exists;
  if not v_exists then return false; end if;
  update public.push_devices set expo_push_token = null,
    is_active = false, notifications_enabled = false, disabled_at = now(),
    disabled_reason = 'user_unregistered', last_seen_at = now()
  where installation_id = p_installation_id and token_hash = p_token_hash and is_active;
  return true;
end;
$$;

create or replace function public.consume_push_rate_limit(
  p_key_hash text, p_endpoint text, p_limit integer, p_window_seconds integer
) returns boolean language plpgsql security invoker set search_path = '' as $$
declare v_count integer;
begin
  if p_limit is null or p_limit < 1 or p_limit > 1000 then
    raise exception using errcode = '22023', message = 'Invalid push rate limit.';
  end if;
  if p_window_seconds is null or p_window_seconds < 1 or p_window_seconds > 86400 then
    raise exception using errcode = '22023', message = 'Invalid push rate limit window.';
  end if;

  with expired as (
    select ctid
    from public.push_rate_limits
    where expires_at <= now()
    order by expires_at
    limit 200
  )
  delete from public.push_rate_limits target
  using expired
  where target.ctid = expired.ctid;
  insert into public.push_rate_limits(key_hash, endpoint, window_started_at, request_count, expires_at)
  values (p_key_hash, p_endpoint, now(), 1, now() + make_interval(secs => p_window_seconds))
  on conflict (key_hash, endpoint) do update set
    request_count = case when public.push_rate_limits.expires_at <= now() then 1
      else public.push_rate_limits.request_count + 1 end,
    window_started_at = case when public.push_rate_limits.expires_at <= now() then now()
      else public.push_rate_limits.window_started_at end,
    expires_at = case when public.push_rate_limits.expires_at <= now()
      then now() + make_interval(secs => p_window_seconds)
      else public.push_rate_limits.expires_at end
  returning request_count into v_count;
  return v_count <= p_limit;
end;
$$;

alter table public.push_devices enable row level security;
alter table public.push_notification_batches enable row level security;
alter table public.push_notification_deliveries enable row level security;
alter table public.push_rate_limits enable row level security;

revoke all on table public.push_devices, public.push_notification_batches,
  public.push_notification_deliveries, public.push_rate_limits
  from public, anon, authenticated;
grant all on table public.push_devices, public.push_notification_batches,
  public.push_notification_deliveries, public.push_rate_limits to service_role;

revoke all on function public.text_array_is_unique_slugs(text[]) from public, anon, authenticated;
grant execute on function public.text_array_is_unique_slugs(text[]) to service_role;
revoke all on function public.set_push_updated_at() from public, anon, authenticated;
grant execute on function public.set_push_updated_at() to service_role;
revoke all on function public.register_push_device(text,text,text,text,text,text,text,text,boolean,boolean,boolean,boolean,text[]) from public, anon, authenticated;
grant execute on function public.register_push_device(text,text,text,text,text,text,text,text,boolean,boolean,boolean,boolean,text[]) to service_role;
revoke all on function public.update_push_device_preferences(text,text,boolean,boolean,boolean,boolean,text[]) from public, anon, authenticated;
grant execute on function public.update_push_device_preferences(text,text,boolean,boolean,boolean,boolean,text[]) to service_role;
revoke all on function public.unregister_push_device(text,text) from public, anon, authenticated;
grant execute on function public.unregister_push_device(text,text) to service_role;
revoke all on function public.consume_push_rate_limit(text,text,integer,integer) from public, anon, authenticated;
grant execute on function public.consume_push_rate_limit(text,text,integer,integer) to service_role;

commit;
