begin;

do $$
declare
  legacy_id constant text := 'install_uuidtest_aaaaaaaa';
  uuid_id constant text := '550e8400-e29b-41d4-a716-446655440000';
  legacy_token constant text := 'Exponent' || 'PushToken[' || 'uuidlegacytokenaaaa' || ']';
  uuid_token constant text := 'Exponent' || 'PushToken[' || 'uuidv4tokenbbbbbbbb' || ']';
  legacy_device_id uuid;
  uuid_device_id uuid;
  updated boolean;
  violated_constraint text;
begin
  select device_id into legacy_device_id from public.register_push_device(
    legacy_id, legacy_token, 'android', 'production', '1.0.0', 'Legacy test',
    null, null, true, true, true, true, '{}'::text[]
  );
  select device_id into uuid_device_id from public.register_push_device(
    uuid_id, uuid_token, 'ios', 'production', '1.0.0', 'UUID test',
    null, null, true, true, true, true, '{}'::text[]
  );

  if legacy_device_id is null or uuid_device_id is null or legacy_device_id = uuid_device_id then
    raise exception 'Legacy and UUID installations did not coexist';
  end if;

  begin
    perform public.register_push_device(
      '550e8400-e29b-11d4-a716-446655440000',
      'Exponent' || 'PushToken[' || 'uuidv1invalidtokena' || ']',
      'android', 'production', null, null, null, null,
      true, true, true, true, '{}'::text[]
    );
    raise exception 'UUID v1 was accepted';
  exception when check_violation then null;
  end;

  begin
    perform public.register_push_device(
      '550e8400e29b41d4a716446655440000',
      'Exponent' || 'PushToken[' || 'uuidmalformedtokena' || ']',
      'android', 'production', null, null, null, null,
      true, true, true, true, '{}'::text[]
    );
    raise exception 'Malformed UUID was accepted';
  exception when check_violation then null;
  end;

  begin
    insert into public.push_devices (
      installation_id, expo_push_token, token_hash, token_last_four,
      platform, runtime_environment
    ) values (
      '550E8400-E29B-41D4-A716-446655440000',
      'Exponent' || 'PushToken[' || 'uppercaseuuidtokenaa' || ']',
      encode(extensions.digest(convert_to(
        'Exponent' || 'PushToken[' || 'uppercaseuuidtokenaa' || ']', 'UTF8'
      ), 'sha256'), 'hex'),
      right('Exponent' || 'PushToken[' || 'uppercaseuuidtokenaa' || ']', 4),
      'android', 'production'
    );
    raise exception 'Uppercase UUID v4 was accepted';
  exception when check_violation then
    get stacked diagnostics violated_constraint = constraint_name;
    if violated_constraint <> 'push_devices_installation_valid' then
      raise exception 'Uppercase UUID failed unexpected constraint: %', violated_constraint;
    end if;
  end;

  begin
    insert into public.push_devices (
      installation_id, expo_push_token, token_hash, token_last_four,
      platform, runtime_environment
    ) values (
      ' 550e8400-e29b-41d4-a716-446655440000 ',
      'Exponent' || 'PushToken[' || 'spaceduuidtokenaaaa' || ']',
      encode(extensions.digest(convert_to(
        'Exponent' || 'PushToken[' || 'spaceduuidtokenaaaa' || ']', 'UTF8'
      ), 'sha256'), 'hex'),
      right('Exponent' || 'PushToken[' || 'spaceduuidtokenaaaa' || ']', 4),
      'ios', 'production'
    );
    raise exception 'Whitespace-padded UUID v4 was accepted';
  exception when check_violation then
    get stacked diagnostics violated_constraint = constraint_name;
    if violated_constraint <> 'push_devices_installation_valid' then
      raise exception 'Whitespace UUID failed unexpected constraint: %', violated_constraint;
    end if;
  end;

  begin
    perform public.register_push_device(
      'install_incomplete',
      'Exponent' || 'PushToken[' || 'legacyinvalidtokena' || ']',
      'android', 'production', null, null, null, null,
      true, true, true, true, '{}'::text[]
    );
    raise exception 'Invalid legacy installation ID was accepted';
  exception when check_violation then null;
  end;

  begin
    insert into public.push_devices (
      installation_id, platform, runtime_environment, is_active
    ) values (legacy_id, 'android', 'production', false);
    raise exception 'Duplicate installation ID was accepted';
  exception when unique_violation then null;
  end;

  updated := public.update_push_device_preferences(
    legacy_id,
    encode(extensions.digest(convert_to(legacy_token, 'UTF8'), 'sha256'), 'hex'),
    false, false, false, false, '{}'::text[]
  );
  if not updated then raise exception 'Legacy preferences update failed'; end if;

  updated := public.update_push_device_preferences(
    uuid_id,
    encode(extensions.digest(convert_to(uuid_token, 'UTF8'), 'sha256'), 'hex'),
    false, false, false, false, '{}'::text[]
  );
  if not updated then raise exception 'UUID preferences update failed'; end if;

  if not public.unregister_push_device(
    legacy_id,
    encode(extensions.digest(convert_to(legacy_token, 'UTF8'), 'sha256'), 'hex')
  ) then raise exception 'Legacy unregister failed'; end if;

  if not public.unregister_push_device(
    uuid_id,
    encode(extensions.digest(convert_to(uuid_token, 'UTF8'), 'sha256'), 'hex')
  ) then raise exception 'UUID unregister failed'; end if;
end;
$$;

rollback;
