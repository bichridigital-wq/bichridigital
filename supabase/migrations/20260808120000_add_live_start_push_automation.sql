begin;

alter table public.push_notification_batches
  alter column request_key type text using request_key::text;

alter table public.push_notification_batches
  drop constraint push_batches_type_valid,
  add constraint push_batches_type_valid
    check (notification_type in ('manual_test', 'live_start')),
  drop constraint push_batches_audience_valid,
  add constraint push_batches_audience_valid
    check (audience_type in ('single_device', 'live_opt_in')),
  add constraint push_batches_request_key_valid check (
    (notification_type = 'manual_test' and request_key ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$')
    or
    (notification_type = 'live_start' and request_key ~ '^live-start:[A-Za-z0-9_-]{11}$')
  ),
  add constraint push_batches_type_audience_valid check (
    (notification_type = 'manual_test' and audience_type = 'single_device')
    or
    (notification_type = 'live_start' and audience_type = 'live_opt_in')
  );

create unique index push_deliveries_batch_device_unique_idx
  on public.push_notification_deliveries (batch_id, device_id)
  where device_id is not null;

commit;
