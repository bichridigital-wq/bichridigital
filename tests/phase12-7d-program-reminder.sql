begin;

do $$
declare
  active_program uuid := '71000000-0000-4000-8000-000000000001';
  inactive_program uuid := '71000000-0000-4000-8000-000000000002';
  good_device uuid := '72000000-0000-4000-8000-000000000001';
  opted_out_device uuid := '72000000-0000-4000-8000-000000000002';
  disabled_device uuid := '72000000-0000-4000-8000-000000000003';
  global_off_device uuid := '72000000-0000-4000-8000-000000000004';
  second_good_device uuid := '72000000-0000-4000-8000-000000000005';
  unsubscribed_device uuid := '72000000-0000-4000-8000-000000000006';
  good_schedule uuid := '73000000-0000-4000-8000-000000000001';
  result_count integer;
  device_count integer;
begin
  insert into public.broadcast_programs (id, name, slug, category, is_active)
  values
    (active_program, 'Programme test rappel', 'programme-test-rappel', 'Test', true),
    (inactive_program, 'Programme inactif rappel', 'programme-inactif-rappel', 'Test', false);

  insert into public.push_devices (
    id, installation_id, expo_push_token, token_hash, token_last_four,
    platform, runtime_environment, notifications_enabled,
    notify_followed_emissions, is_active
  ) values
    (good_device, 'install_test_good0001', 'ExponentPushToken[programremindergood]', encode(extensions.digest(convert_to('ExponentPushToken[programremindergood]', 'UTF8'), 'sha256'), 'hex'), 'ood]', 'android', 'production', true, true, true),
    (opted_out_device, 'install_test_optout01', 'ExponentPushToken[programreminderoptout]', encode(extensions.digest(convert_to('ExponentPushToken[programreminderoptout]', 'UTF8'), 'sha256'), 'hex'), 'out]', 'android', 'production', true, false, true),
    (disabled_device, 'install_test_disabled1', null, null, null, 'android', 'production', true, true, false),
    (global_off_device, 'install_test_globaloff', 'ExponentPushToken[programreminderoff]', encode(extensions.digest(convert_to('ExponentPushToken[programreminderoff]', 'UTF8'), 'sha256'), 'hex'), 'off]', 'android', 'production', false, true, true),
    (second_good_device, 'install_test_good0002', 'ExponentPushToken[programremindergoodtwo]', encode(extensions.digest(convert_to('ExponentPushToken[programremindergoodtwo]', 'UTF8'), 'sha256'), 'hex'), 'two]', 'android', 'production', true, true, true),
    (unsubscribed_device, 'install_test_nofollow', 'ExponentPushToken[programremindernofollow]', encode(extensions.digest(convert_to('ExponentPushToken[programremindernofollow]', 'UTF8'), 'sha256'), 'hex'), 'low]', 'android', 'production', true, true, true);

  insert into public.push_device_program_subscriptions (push_device_id, program_id)
  values
    (good_device, active_program),
    (opted_out_device, active_program),
    (disabled_device, active_program),
    (global_off_device, active_program),
    (second_good_device, active_program);

  insert into public.broadcast_schedule (
    id, title, scheduled_start_time, status, is_published, program_id
  ) values
    (good_schedule, 'Titre libre ignoré', now() + interval '10 minutes', 'scheduled', true, active_program),
    ('73000000-0000-4000-8000-000000000002', 'Non publié', now() + interval '10 minutes', 'scheduled', false, active_program),
    ('73000000-0000-4000-8000-000000000003', 'Annulé', now() + interval '10 minutes', 'cancelled', true, active_program),
    ('73000000-0000-4000-8000-000000000004', 'Terminé', now() + interval '10 minutes', 'completed', true, active_program),
    ('73000000-0000-4000-8000-000000000005', 'Sans programme', now() + interval '10 minutes', 'scheduled', true, null),
    ('73000000-0000-4000-8000-000000000006', 'Programme inactif', now() + interval '10 minutes', 'scheduled', true, inactive_program),
    ('73000000-0000-4000-8000-000000000007', 'T moins seize', now() + interval '16 minutes', 'scheduled', true, active_program),
    ('73000000-0000-4000-8000-000000000008', 'Déjà commencé', now() - interval '1 minute', 'scheduled', true, active_program);

  select count(*), coalesce(max(jsonb_array_length(devices)), 0)
  into result_count, device_count
  from public.select_eligible_program_reminders()
  where schedule_id = good_schedule;

  if result_count <> 1 or device_count <> 2 then
    raise exception 'eligible schedule or audience filter failed';
  end if;

  select count(*) into result_count
  from public.select_eligible_program_reminders()
  where schedule_id <> good_schedule;
  if result_count <> 0 then
    raise exception 'ineligible schedules were returned';
  end if;

  if has_function_privilege('anon', 'public.select_eligible_program_reminders()', 'execute')
     or has_function_privilege('authenticated', 'public.select_eligible_program_reminders()', 'execute') then
    raise exception 'reminder function is publicly executable';
  end if;

  insert into public.push_notification_batches (
    request_key, notification_type, title, body, data, audience_type, status
  ) values (
    'program-reminder:' || good_schedule::text || ':2026-08-10T21:30:00.000Z',
    'program_reminder', 'Rappel', 'Message', '{}', 'program_followers', 'pending'
  );

  begin
    insert into public.push_notification_batches (
      request_key, notification_type, title, body, data, audience_type, status
    ) values (
      'program-reminder:' || good_schedule::text || ':2026-08-10T21:30:00.000Z',
      'program_reminder', 'Rappel', 'Message', '{}', 'program_followers', 'pending'
    );
    raise exception 'duplicate request key was accepted';
  exception when unique_violation then
    null;
  end;

  begin
    insert into public.push_notification_batches (
      request_key, notification_type, title, body, data, audience_type, status
    ) values (
      'program-reminder:' || good_schedule::text || ':2026-08-10T22:00:00.000Z',
      'program_reminder', 'Rappel', 'Message', '{}', 'single_device', 'pending'
    );
    raise exception 'invalid program reminder audience was accepted';
  exception when check_violation then
    null;
  end;
end;
$$;

rollback;
