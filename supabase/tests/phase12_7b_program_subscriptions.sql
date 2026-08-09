begin;

do $$
declare
  device_one uuid := '71000000-0000-4000-8000-000000000001';
  device_two uuid := '71000000-0000-4000-8000-000000000002';
  program_one uuid := '72000000-0000-4000-8000-000000000001';
  program_two uuid := '72000000-0000-4000-8000-000000000002';
  program_three uuid := '72000000-0000-4000-8000-000000000003';
  duplicate_rejected boolean := false;
  foreign_key_rejected boolean := false;
  token_one_hash text := encode(
    extensions.digest(convert_to('ExponentPushToken[phase127b-device-one]', 'UTF8'), 'sha256'),
    'hex'
  );
  token_two_hash text := encode(
    extensions.digest(convert_to('ExponentPushToken[phase127b-device-two]', 'UTF8'), 'sha256'),
    'hex'
  );
  result text;
begin
  if not (
    select relrowsecurity
    from pg_class
    where oid = 'public.push_device_program_subscriptions'::regclass
  ) then
    raise exception 'RLS is not enabled';
  end if;
  if has_table_privilege('anon', 'public.push_device_program_subscriptions', 'select')
    or has_table_privilege('authenticated', 'public.push_device_program_subscriptions', 'select')
    or not has_table_privilege('service_role', 'public.push_device_program_subscriptions', 'select') then
    raise exception 'subscription grants are unsafe';
  end if;

  insert into public.broadcast_programs (
    id, name, slug, category, default_duration_minutes, is_active, sort_order
  ) values
    (program_one, 'Programme un', 'phase-127b-un', 'Test', 60, true, 0),
    (program_two, 'Programme deux', 'phase-127b-deux', 'Test', 60, true, 1),
    (program_three, 'Programme inactif', 'phase-127b-inactif', 'Test', 60, false, 2);

  insert into public.push_devices (
    id, installation_id, expo_push_token, token_hash, token_last_four,
    platform, runtime_environment, followed_emission_slugs
  ) values
    (
      device_one, 'install_phase127b_device0001',
      'ExponentPushToken[phase127b-device-one]',
      encode(extensions.digest(convert_to('ExponentPushToken[phase127b-device-one]', 'UTF8'), 'sha256'), 'hex'),
      'one]', 'android', 'production',
      array['phase-127b-un', 'slug-inconnu']
    ),
    (
      device_two, 'install_phase127b_device0002',
      'ExponentPushToken[phase127b-device-two]',
      encode(extensions.digest(convert_to('ExponentPushToken[phase127b-device-two]', 'UTF8'), 'sha256'), 'hex'),
      'two]', 'android', 'production', '{}'
    );

  -- Rejoue le backfill de la migration : slug connu, inconnu et paire dÃ©jÃ 
  -- prÃ©sente restent tous idempotents.
  insert into public.push_device_program_subscriptions (push_device_id, program_id)
  select distinct device.id, program.id
  from public.push_devices device
  cross join lateral unnest(device.followed_emission_slugs) as followed(slug)
  join public.broadcast_programs program on program.slug = followed.slug
  on conflict (push_device_id, program_id) do nothing;
  insert into public.push_device_program_subscriptions values (device_one, program_one, now())
  on conflict (push_device_id, program_id) do nothing;

  if (select count(*) from public.push_device_program_subscriptions
      where push_device_id = device_one) <> 1 then
    raise exception 'backfill did not ignore unknown or duplicate slugs';
  end if;
  if exists (select 1 from public.push_device_program_subscriptions
      where push_device_id = device_two) then
    raise exception 'empty legacy array created a subscription';
  end if;

  select public.follow_push_device_program(
    'install_phase127b_device0001', repeat('0', 64), program_two, 100
  ) into result;
  if result <> 'ownership_mismatch' then raise exception 'invalid proof was accepted'; end if;
  select public.follow_push_device_program(
    'install_phase127b_device0001', token_one_hash, program_three, 100
  ) into result;
  if result <> 'program_unavailable' then raise exception 'inactive program was accepted'; end if;

  select public.follow_push_device_program(
    'install_phase127b_device0001', token_one_hash, program_two, 100
  ) into result;
  select public.follow_push_device_program(
    'install_phase127b_device0001', token_one_hash, program_two, 100
  ) into result;
  if result <> 'followed' or (
    select count(*) from public.push_device_program_subscriptions
    where push_device_id = device_one and program_id = program_two
  ) <> 1 then
    raise exception 'follow is not idempotent';
  end if;
  if not exists (
    select 1 from public.push_devices
    where id = device_one and 'phase-127b-deux' = any(followed_emission_slugs)
  ) then
    raise exception 'follow did not maintain the legacy array';
  end if;

  select public.follow_push_device_program(
    'install_phase127b_device0002', token_two_hash, program_one, 100
  ) into result;
  select public.unfollow_push_device_program(
    'install_phase127b_device0001', token_one_hash, program_one
  ) into result;
  select public.unfollow_push_device_program(
    'install_phase127b_device0001', token_one_hash, program_one
  ) into result;
  if result <> 'unfollowed' then raise exception 'unfollow is not idempotent'; end if;
  if exists (select 1 from public.push_device_program_subscriptions
      where push_device_id = device_one and program_id = program_one)
    or not exists (select 1 from public.push_device_program_subscriptions
      where push_device_id = device_two and program_id = program_one) then
    raise exception 'unfollow affected the wrong device';
  end if;

  select public.follow_push_device_program(
    'install_phase127b_device0001', token_one_hash, program_one, 1
  ) into result;
  if result <> 'limit_reached' then raise exception 'subscription limit was not enforced'; end if;

  perform public.sync_push_device_program_subscriptions(
    device_one,
    array['phase-127b-un', 'phase-127b-deux', 'slug-inconnu']
  );
  if (select count(*) from public.push_device_program_subscriptions
      where push_device_id = device_one) <> 2 then
    raise exception 'multiple known programs were not synchronized';
  end if;

  perform public.sync_push_device_program_subscriptions(
    device_one,
    array['phase-127b-deux', 'phase-127b-inactif']
  );
  if (select array_agg(program_id order by program_id)
      from public.push_device_program_subscriptions
      where push_device_id = device_one) <> array[program_two] then
    raise exception 'legacy removal or inactive filtering failed';
  end if;

  begin
    insert into public.push_device_program_subscriptions values (device_one, program_two, now());
  exception when unique_violation then
    duplicate_rejected := true;
  end;
  if not duplicate_rejected then raise exception 'unique pair was not enforced'; end if;

  begin
    insert into public.push_device_program_subscriptions
      values (device_one, '72999999-0000-4000-8000-000000000099', now());
  exception when foreign_key_violation then
    foreign_key_rejected := true;
  end;
  if not foreign_key_rejected then raise exception 'program FK was not enforced'; end if;

  delete from public.push_devices where id = device_two;
  if exists (select 1 from public.push_device_program_subscriptions
      where push_device_id = device_two) then
    raise exception 'device cascade failed';
  end if;

  insert into public.push_device_program_subscriptions values (device_one, program_one, now());
  delete from public.broadcast_programs where id = program_one;
  if exists (select 1 from public.push_device_program_subscriptions
      where program_id = program_one) then
    raise exception 'program cascade failed';
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'push_rate_endpoint_valid'
      and pg_get_constraintdef(oid) like '%program_subscriptions_follow%'
      and pg_get_constraintdef(oid) like '%program_subscriptions_unfollow%'
      and pg_get_constraintdef(oid) like '%program_subscriptions_list%'
  ) then
    raise exception 'program subscription rate-limit endpoints are missing';
  end if;
end;
$$;

rollback;
