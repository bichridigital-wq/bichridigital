begin;

do $$
declare
  live_batch_id uuid;
  device_id uuid;
begin
  insert into public.push_notification_batches (
    request_key, notification_type, title, body, data, audience_type, status
  ) values (
    'live-start:abcdefghijk', 'live_start', 'Bichridigital est en direct',
    'Titre YouTube', '{"type":"live"}'::jsonb, 'live_opt_in', 'sending'
  ) returning id into live_batch_id;

  begin
    insert into public.push_notification_batches (
      request_key, notification_type, title, body, data, audience_type, status
    ) values (
      'live-start:abcdefghijk', 'live_start', 'Bichridigital est en direct',
      'Titre YouTube', '{"type":"live"}'::jsonb, 'live_opt_in', 'sending'
    );
    raise exception 'Duplicate live request key was accepted';
  exception when unique_violation then null;
  end;

  begin
    insert into public.push_notification_batches (
      request_key, notification_type, title, body, data, audience_type, status
    ) values (
      'live-start:abcdefghijl', 'live_start', 'Bichridigital est en direct',
      'Titre YouTube', '{"type":"live"}'::jsonb, 'single_device', 'sending'
    );
    raise exception 'Mismatched live audience was accepted';
  exception when check_violation then null;
  end;

  select registered.device_id into device_id
  from public.register_push_device(
    'install_live_aaaaaaaa', 'Exponent' || 'PushToken[' || 'phase125alivetokenaaa' || ']',
    'android', 'production', '1.0.0', 'Test live', null, null,
    true, true, true, true, '{}'
  ) registered;

  insert into public.push_notification_deliveries (batch_id, device_id, attempts)
  values (live_batch_id, device_id, 1);
  begin
    insert into public.push_notification_deliveries (batch_id, device_id, attempts)
    values (live_batch_id, device_id, 1);
    raise exception 'Duplicate delivery for a live batch was accepted';
  exception when unique_violation then null;
  end;
end;
$$;

rollback;
