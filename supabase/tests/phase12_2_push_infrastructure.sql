begin;

do $$
declare
  first_id uuid;
  same_id uuid;
  transferred_id uuid;
  is_valid boolean;
  i integer;
begin
  select device_id into first_id from public.register_push_device(
    'install_test_aaaaaaaa', 'Exponent' || 'PushToken[' || 'phase12testtokenaaaa' || ']',
    'android', 'production', '1.0.0', 'Test local', null, null,
    true, true, true, true, array['jotaayu-bichri']
  );
  select device_id into same_id from public.register_push_device(
    'install_test_aaaaaaaa', 'Exponent' || 'PushToken[' || 'phase12testtokenaaaa' || ']',
    'android', 'production', '1.0.0', 'Test local', null, null,
    true, true, true, true, array['jotaayu-bichri']
  );
  if first_id <> same_id then raise exception 'Same installation created a duplicate'; end if;
  if not exists (
    select 1 from public.push_devices
    where id = first_id
      and token_hash = encode(
        extensions.digest(convert_to(expo_push_token, 'UTF8'), 'sha256'),
        'hex'
      )
      and token_last_four = right(expo_push_token, 4)
  ) then raise exception 'Token metadata was not derived by PostgreSQL'; end if;

  begin
    update public.push_devices set token_last_four = null where id = first_id;
    raise exception 'A token without token_last_four was accepted';
  exception when check_violation then null;
  end;

  begin
    update public.push_devices set token_hash = null where id = first_id;
    raise exception 'A token without token_hash was accepted';
  exception when check_violation then null;
  end;

  begin
    update public.push_devices set expo_push_token = 'short',
      token_hash = encode(
        extensions.digest(convert_to('short', 'UTF8'), 'sha256'),
        'hex'
      ),
      token_last_four = 'hort'
    where id = first_id;
    raise exception 'An unreasonably short token was accepted';
  exception when check_violation then null;
  end;

  perform public.register_push_device(
    'install_test_aaaaaaaa', 'Exponent' || 'PushToken[' || 'phase12testtokenbbbb' || ']',
    'android', 'production', '1.0.1', 'Test local', null, null,
    true, true, true, true, '{}'::text[]
  );
  select device_id into transferred_id from public.register_push_device(
    'install_test_bbbbbbbb', 'Exponent' || 'PushToken[' || 'phase12testtokenbbbb' || ']',
    'ios', 'production', '1.0.1', 'Test local 2', null, null,
    true, true, true, true, '{}'::text[]
  );
  if transferred_id = first_id then raise exception 'Token transfer did not change owner'; end if;
  if exists(select 1 from public.push_devices where id = first_id and is_active) then
    raise exception 'Previous token owner is still active';
  end if;

  is_valid := public.update_push_device_preferences(
    'install_test_bbbbbbbb', repeat('c', 64), false, false, false, false, '{}'
  );
  if is_valid then raise exception 'Foreign proof was accepted'; end if;

  is_valid := public.unregister_push_device(
    'install_test_bbbbbbbb',
    encode(extensions.digest(
      convert_to('Exponent' || 'PushToken[' || 'phase12testtokenbbbb' || ']', 'UTF8'),
      'sha256'
    ), 'hex')
  );
  if not is_valid then raise exception 'Valid unregister failed'; end if;
  is_valid := public.unregister_push_device(
    'install_test_bbbbbbbb',
    encode(extensions.digest(
      convert_to('Exponent' || 'PushToken[' || 'phase12testtokenbbbb' || ']', 'UTF8'),
      'sha256'
    ), 'hex')
  );
  if not is_valid then raise exception 'Unregister is not idempotent'; end if;
  if exists(select 1 from public.push_devices where id = transferred_id and expo_push_token is not null) then
    raise exception 'Raw token survived unregister';
  end if;

  select device_id into same_id from public.register_push_device(
    'install_test_bbbbbbbb', 'Exponent' || 'PushToken[' || 'phase12testtokenbbbb' || ']',
    'ios', 'production', '1.0.2', 'Test local 2', null, null,
    true, true, true, true, '{}'::text[]
  );
  if same_id <> transferred_id or not exists (
    select 1 from public.push_devices where id = transferred_id and is_active
  ) then raise exception 'Device re-registration failed'; end if;

  insert into public.push_notification_batches (
    request_key, notification_type, title, body, audience_type, status
  ) values (
    '40000000-0000-4000-8000-000000000001', 'manual_test', 'Test', 'Test',
    'single_device', 'pending'
  );
  begin
    insert into public.push_notification_batches (
      request_key, notification_type, title, body, audience_type, status
    ) values (
      '40000000-0000-4000-8000-000000000001', 'manual_test', 'Test', 'Test',
      'single_device', 'pending'
    );
    raise exception 'Duplicate request key was accepted';
  exception when unique_violation then null;
  end;

  begin
    insert into public.push_notification_batches (
      request_key, notification_type, title, body, data, audience_type, status
    ) values (
      '40000000-0000-4000-8000-000000000002', 'manual_test', 'Test', 'Test',
      '[]'::jsonb, 'single_device', 'pending'
    );
    raise exception 'Non-object batch data was accepted';
  exception when check_violation then null;
  end;

  begin
    insert into public.push_notification_batches (
      request_key, notification_type, title, body, audience_type, status,
      requested_count, accepted_count, failed_count
    ) values (
      '40000000-0000-4000-8000-000000000003', 'manual_test', 'Test', 'Test',
      'single_device', 'completed', 1, 1, 1
    );
    raise exception 'Inconsistent batch counters were accepted';
  exception when check_violation then null;
  end;

  begin
    perform public.consume_push_rate_limit(repeat('d', 64), 'register', 0, 900);
    raise exception 'Invalid rate limit was accepted';
  exception when sqlstate '22023' then null;
  end;

  begin
    perform public.consume_push_rate_limit(repeat('e', 64), 'register', 20, 0);
    raise exception 'Invalid rate window was accepted';
  exception when sqlstate '22023' then null;
  end;

  for i in 1..205 loop
    insert into public.push_rate_limits (
      key_hash, endpoint, window_started_at, request_count, expires_at
    ) values (
      lpad(to_hex(i), 64, '0'), 'register', now() - interval '1 hour', 1,
      now() - interval '1 minute'
    );
  end loop;
  perform public.consume_push_rate_limit(repeat('f', 64), 'preferences', 20, 900);
  if (select count(*) from public.push_rate_limits where expires_at <= now()) <> 5 then
    raise exception 'Expired rate-limit cleanup was not bounded to 200 rows';
  end if;
end;
$$;

rollback;
