begin;

create table public.youtube_push_automation_state (
  automation_key text primary key,
  last_seen_video_id text not null,
  last_seen_published_at timestamptz not null,
  initialized_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint youtube_push_state_key_valid check (
    automation_key = 'video_published'
  ),
  constraint youtube_push_state_video_id_valid check (
    last_seen_video_id ~ '^[A-Za-z0-9_-]{11}$'
  )
);

alter table public.youtube_push_automation_state enable row level security;

revoke all on table public.youtube_push_automation_state
  from public, anon, authenticated;
grant select, insert, update on table public.youtube_push_automation_state
  to service_role;

create trigger set_youtube_push_automation_state_updated_at
before update on public.youtube_push_automation_state
for each row execute function public.set_push_updated_at();

create or replace function public.advance_youtube_video_push_state(
  p_video_id text,
  p_published_at timestamptz
)
returns boolean
language plpgsql
security invoker
set search_path = ''
as $$
declare
  affected_rows integer;
begin
  if p_video_id !~ '^[A-Za-z0-9_-]{11}$' or p_published_at is null then
    raise exception 'invalid youtube automation state';
  end if;

  insert into public.youtube_push_automation_state (
    automation_key,
    last_seen_video_id,
    last_seen_published_at
  ) values (
    'video_published',
    p_video_id,
    p_published_at
  )
  on conflict (automation_key) do update
  set last_seen_video_id = excluded.last_seen_video_id,
      last_seen_published_at = excluded.last_seen_published_at
  where excluded.last_seen_published_at >
    public.youtube_push_automation_state.last_seen_published_at;

  get diagnostics affected_rows = row_count;
  return affected_rows > 0;
end;
$$;

revoke all on function public.advance_youtube_video_push_state(text, timestamptz)
  from public, anon, authenticated;
grant execute on function public.advance_youtube_video_push_state(text, timestamptz)
  to service_role;

alter table public.push_notification_batches
  drop constraint push_batches_type_valid,
  add constraint push_batches_type_valid check (
    notification_type in ('manual_test', 'live_start', 'video_published')
  ),
  drop constraint push_batches_audience_valid,
  add constraint push_batches_audience_valid check (
    audience_type in ('single_device', 'live_opt_in', 'video_opt_in')
  ),
  drop constraint push_batches_request_key_valid,
  add constraint push_batches_request_key_valid check (
    (notification_type = 'manual_test' and request_key ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$')
    or
    (notification_type = 'live_start' and request_key ~ '^live-start:[A-Za-z0-9_-]{11}$')
    or
    (notification_type = 'video_published' and request_key ~ '^video-published:[A-Za-z0-9_-]{11}$')
  ),
  drop constraint push_batches_type_audience_valid,
  add constraint push_batches_type_audience_valid check (
    (notification_type = 'manual_test' and audience_type = 'single_device')
    or
    (notification_type = 'live_start' and audience_type = 'live_opt_in')
    or
    (notification_type = 'video_published' and audience_type = 'video_opt_in')
  );

commit;
