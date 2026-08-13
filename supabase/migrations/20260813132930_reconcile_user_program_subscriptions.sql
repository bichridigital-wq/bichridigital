begin;

alter table public.account_rate_limits
  drop constraint account_rate_limits_endpoint_valid,
  add constraint account_rate_limits_endpoint_valid check (endpoint in (
    'me_get', 'me_update', 'account_link_device', 'account_unlink_device',
    'me_program_subscriptions_list', 'me_program_subscriptions_follow',
    'me_program_subscriptions_unfollow', 'me_program_subscriptions_reconcile'
  ));

create or replace function public.reconcile_user_program_subscriptions(
  p_user_id uuid,
  p_push_device_id uuid,
  p_local_program_ids uuid[] default '{}'::uuid[]
) returns uuid[]
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_program_ids uuid[];
begin
  if p_user_id is null then
    raise exception using errcode = '22023', message = 'Invalid user.';
  end if;
  if coalesce(cardinality(p_local_program_ids), 0) > 100 then
    raise exception using errcode = '22023', message = 'Too many programs.';
  end if;

  perform pg_advisory_xact_lock(hashtextextended('account-programs:' || p_user_id::text, 0));

  if p_push_device_id is not null and not exists (
    select 1 from public.push_devices
    where id = p_push_device_id and user_id = p_user_id
  ) then
    raise exception using errcode = '42501', message = 'Device ownership mismatch.';
  end if;

  select coalesce(array_agg(program_id order by program_id), '{}'::uuid[])
  into v_program_ids
  from (
    select subscription.program_id
    from public.user_program_subscriptions subscription
    where subscription.user_id = p_user_id
    union
    select subscription.program_id
    from public.push_device_program_subscriptions subscription
    join public.push_devices device on device.id = subscription.push_device_id
    where device.user_id = p_user_id
    union
    select program.id
    from public.broadcast_programs program
    where program.is_active
      and program.id = any(coalesce(p_local_program_ids, '{}'::uuid[]))
  ) union_programs;

  insert into public.user_program_subscriptions(user_id, program_id)
  select p_user_id, unnest(v_program_ids)
  on conflict (user_id, program_id) do nothing;

  insert into public.push_device_program_subscriptions(push_device_id, program_id)
  select device.id, program_id
  from public.push_devices device
  cross join unnest(v_program_ids) as programs(program_id)
  where device.user_id = p_user_id
  on conflict (push_device_id, program_id) do nothing;

  update public.push_devices device
  set followed_emission_slugs = coalesce((
    select array_agg(program.slug order by program.slug)
    from public.broadcast_programs program
    where program.id = any(v_program_ids)
  ), '{}'::text[])
  where device.user_id = p_user_id;

  return v_program_ids;
end;
$$;

create or replace function public.follow_user_program_subscription(
  p_user_id uuid,
  p_program_id uuid,
  p_limit integer default 100
) returns text
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_program_slug text;
begin
  if p_limit < 1 or p_limit > 100 then
    raise exception using errcode = '22023', message = 'Invalid follow limit.';
  end if;
  perform pg_advisory_xact_lock(hashtextextended('account-programs:' || p_user_id::text, 0));
  select slug into v_program_slug from public.broadcast_programs
  where id = p_program_id and is_active;
  if v_program_slug is null then return 'program_unavailable'; end if;
  if not exists (
    select 1 from public.user_program_subscriptions
    where user_id = p_user_id and program_id = p_program_id
  ) and (
    select count(*) from public.user_program_subscriptions where user_id = p_user_id
  ) >= p_limit then return 'limit_reached'; end if;

  insert into public.user_program_subscriptions(user_id, program_id)
  values (p_user_id, p_program_id)
  on conflict (user_id, program_id) do nothing;
  insert into public.push_device_program_subscriptions(push_device_id, program_id)
  select id, p_program_id from public.push_devices where user_id = p_user_id
  on conflict (push_device_id, program_id) do nothing;
  update public.push_devices set followed_emission_slugs = array(
    select distinct slug from unnest(followed_emission_slugs || array[v_program_slug]) slug
    order by slug
  ) where user_id = p_user_id;
  return 'followed';
end;
$$;

create or replace function public.unfollow_user_program_subscription(
  p_user_id uuid,
  p_program_id uuid
) returns text
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_program_slug text;
begin
  perform pg_advisory_xact_lock(hashtextextended('account-programs:' || p_user_id::text, 0));
  select slug into v_program_slug from public.broadcast_programs where id = p_program_id;
  delete from public.user_program_subscriptions
  where user_id = p_user_id and program_id = p_program_id;
  delete from public.push_device_program_subscriptions subscription
  using public.push_devices device
  where subscription.push_device_id = device.id
    and device.user_id = p_user_id
    and subscription.program_id = p_program_id;
  if v_program_slug is not null then
    update public.push_devices
    set followed_emission_slugs = array_remove(followed_emission_slugs, v_program_slug)
    where user_id = p_user_id;
  end if;
  return 'unfollowed';
end;
$$;

revoke all on function public.reconcile_user_program_subscriptions(uuid,uuid,uuid[]) from public, anon, authenticated;
revoke all on function public.follow_user_program_subscription(uuid,uuid,integer) from public, anon, authenticated;
revoke all on function public.unfollow_user_program_subscription(uuid,uuid) from public, anon, authenticated;
grant execute on function public.reconcile_user_program_subscriptions(uuid,uuid,uuid[]) to service_role;
grant execute on function public.follow_user_program_subscription(uuid,uuid,integer) to service_role;
grant execute on function public.unfollow_user_program_subscription(uuid,uuid) to service_role;

commit;
