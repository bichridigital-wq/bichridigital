begin;

alter table public.push_notification_batches
  drop constraint push_batches_type_valid,
  add constraint push_batches_type_valid check (
    notification_type in ('manual_test', 'live_start', 'video_published', 'program_reminder')
  ),
  drop constraint push_batches_audience_valid,
  add constraint push_batches_audience_valid check (
    audience_type in ('single_device', 'live_opt_in', 'video_opt_in', 'program_followers')
  ),
  drop constraint push_batches_request_key_valid,
  add constraint push_batches_request_key_valid check (
    (notification_type = 'manual_test' and request_key ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$')
    or (notification_type = 'live_start' and request_key ~ '^live-start:[A-Za-z0-9_-]{11}$')
    or (notification_type = 'video_published' and request_key ~ '^video-published:[A-Za-z0-9_-]{11}$')
    or (notification_type = 'program_reminder' and request_key ~ '^program-reminder:[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}:[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}[.][0-9]{3}Z$')
  ),
  drop constraint push_batches_type_audience_valid,
  add constraint push_batches_type_audience_valid check (
    (notification_type = 'manual_test' and audience_type = 'single_device')
    or (notification_type = 'live_start' and audience_type = 'live_opt_in')
    or (notification_type = 'video_published' and audience_type = 'video_opt_in')
    or (notification_type = 'program_reminder' and audience_type = 'program_followers')
  );

create index broadcast_schedule_program_reminder_idx
  on public.broadcast_schedule (scheduled_start_time, program_id)
  where is_published = true and status = 'scheduled' and program_id is not null;

create or replace function public.select_eligible_program_reminders()
returns table (
  schedule_id uuid,
  program_id uuid,
  program_name text,
  program_slug text,
  scheduled_start_time timestamptz,
  devices jsonb
)
language sql
security invoker
set search_path = ''
as $$
  select
    schedule.id,
    program.id,
    program.name,
    program.slug,
    schedule.scheduled_start_time,
    coalesce(
      jsonb_agg(
        jsonb_build_object(
          'id', device.id,
          'expoPushToken', device.expo_push_token,
          'tokenLastFour', device.token_last_four
        ) order by device.id
      ) filter (where device.id is not null),
      '[]'::jsonb
    ) as devices
  from public.broadcast_schedule as schedule
  join public.broadcast_programs as program
    on program.id = schedule.program_id and program.is_active = true
  left join public.push_device_program_subscriptions as subscription
    on subscription.program_id = schedule.program_id
  left join public.push_devices as device
    on device.id = subscription.push_device_id
    and device.is_active = true
    and device.notifications_enabled = true
    and device.notify_followed_emissions = true
    and device.expo_push_token is not null
  where schedule.is_published = true
    and schedule.status = 'scheduled'
    and schedule.program_id is not null
    and schedule.scheduled_start_time > now()
    and schedule.scheduled_start_time <= now() + interval '15 minutes'
  group by schedule.id, program.id, program.name, program.slug, schedule.scheduled_start_time
  order by schedule.scheduled_start_time, schedule.id;
$$;

revoke all on function public.select_eligible_program_reminders()
  from public, anon, authenticated;
grant execute on function public.select_eligible_program_reminders()
  to service_role;

commit;
