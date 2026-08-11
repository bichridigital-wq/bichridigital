begin;

create table public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  avatar_url text null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_display_name_valid check (
    display_name = btrim(display_name)
    and char_length(display_name) between 2 and 80
  ),
  constraint profiles_avatar_url_valid check (
    avatar_url is null or (
      avatar_url = btrim(avatar_url)
      and char_length(avatar_url) between 1 and 2048
      and avatar_url ~ '^https://[^[:space:]]+$'
    )
  )
);

create trigger set_profiles_updated_at
before update on public.profiles
for each row execute function public.set_push_updated_at();

alter table public.profiles enable row level security;
revoke all on table public.profiles from public, anon, authenticated;
grant select, insert, update on table public.profiles to authenticated;
grant all on table public.profiles to service_role;

create policy "Users can read their own profile"
on public.profiles for select to authenticated
using ((select auth.uid()) = user_id);

create policy "Users can create their own profile"
on public.profiles for insert to authenticated
with check ((select auth.uid()) = user_id);

create policy "Users can update their own profile"
on public.profiles for update to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create table public.user_program_subscriptions (
  user_id uuid not null references auth.users(id) on delete cascade,
  program_id uuid not null references public.broadcast_programs(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, program_id)
);

create index user_program_subscriptions_program_user_idx
on public.user_program_subscriptions (program_id, user_id);

alter table public.user_program_subscriptions enable row level security;
revoke all on table public.user_program_subscriptions from public, anon, authenticated;
grant select, insert, delete on table public.user_program_subscriptions to authenticated;
grant all on table public.user_program_subscriptions to service_role;

create policy "Users can read their own program subscriptions"
on public.user_program_subscriptions for select to authenticated
using ((select auth.uid()) = user_id);

create policy "Users can create their own program subscriptions"
on public.user_program_subscriptions for insert to authenticated
with check ((select auth.uid()) = user_id);

create policy "Users can delete their own program subscriptions"
on public.user_program_subscriptions for delete to authenticated
using ((select auth.uid()) = user_id);

alter table public.push_devices
add column user_id uuid null references auth.users(id) on delete set null;

create index push_devices_user_idx on public.push_devices (user_id)
where user_id is not null;

create table public.account_rate_limits (
  key_hash text not null,
  endpoint text not null,
  window_started_at timestamptz not null,
  request_count integer not null default 1,
  expires_at timestamptz not null,
  primary key (key_hash, endpoint),
  constraint account_rate_limits_key_valid check (key_hash ~ '^[0-9a-f]{64}$'),
  constraint account_rate_limits_endpoint_valid check (endpoint in (
    'me_get', 'me_update', 'account_link_device', 'account_unlink_device',
    'me_program_subscriptions_list', 'me_program_subscriptions_follow',
    'me_program_subscriptions_unfollow'
  )),
  constraint account_rate_limits_count_valid check (request_count > 0)
);

create index account_rate_limits_expiry_idx
on public.account_rate_limits (expires_at);

create or replace function public.consume_account_rate_limit(
  p_key_hash text, p_endpoint text, p_limit integer, p_window_seconds integer
) returns boolean
language plpgsql security invoker set search_path = '' as $$
declare v_count integer;
begin
  if p_limit is null or p_limit < 1 or p_limit > 1000 then
    raise exception using errcode = '22023', message = 'Invalid account rate limit.';
  end if;
  if p_window_seconds is null or p_window_seconds < 1 or p_window_seconds > 86400 then
    raise exception using errcode = '22023', message = 'Invalid account rate limit window.';
  end if;
  delete from public.account_rate_limits where expires_at <= now();
  insert into public.account_rate_limits(key_hash, endpoint, window_started_at, request_count, expires_at)
  values (p_key_hash, p_endpoint, now(), 1, now() + make_interval(secs => p_window_seconds))
  on conflict (key_hash, endpoint) do update set
    request_count = case when public.account_rate_limits.expires_at <= now() then 1 else public.account_rate_limits.request_count + 1 end,
    window_started_at = case when public.account_rate_limits.expires_at <= now() then now() else public.account_rate_limits.window_started_at end,
    expires_at = case when public.account_rate_limits.expires_at <= now() then now() + make_interval(secs => p_window_seconds) else public.account_rate_limits.expires_at end
  returning request_count into v_count;
  return v_count <= p_limit;
end;
$$;

alter table public.account_rate_limits enable row level security;
revoke all on table public.account_rate_limits from public, anon, authenticated;
grant all on table public.account_rate_limits to service_role;
revoke all on function public.consume_account_rate_limit(text,text,integer,integer) from public, anon, authenticated;
grant execute on function public.consume_account_rate_limit(text,text,integer,integer) to service_role;

commit;
