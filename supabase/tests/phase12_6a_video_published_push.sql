begin;

do $$
declare
  changed boolean;
  duplicate_rejected boolean := false;
begin
  select public.advance_youtube_video_push_state(
    'abcdefghijk',
    '2026-08-08T12:00:00Z'::timestamptz
  ) into changed;
  if not changed then raise exception 'baseline was not initialized'; end if;

  select public.advance_youtube_video_push_state(
    'lmnopqrstuv',
    '2026-08-08T11:00:00Z'::timestamptz
  ) into changed;
  if changed then raise exception 'state moved backwards'; end if;

  insert into public.push_notification_batches (
    request_key, notification_type, title, body, data,
    audience_type, status, requested_count
  ) values (
    'video-published:abcdefghijk', 'video_published',
    'Nouvelle vidéo', 'Titre réel',
    '{"type":"video","videoId":"abcdefghijk"}'::jsonb,
    'video_opt_in', 'sending', 0
  );

  begin
    insert into public.push_notification_batches (
      request_key, notification_type, title, body, data,
      audience_type, status, requested_count
    ) values (
      'video-published:abcdefghijk', 'video_published',
      'Nouvelle vidéo', 'Titre réel',
      '{"type":"video","videoId":"abcdefghijk"}'::jsonb,
      'video_opt_in', 'sending', 0
    );
  exception when unique_violation then
    duplicate_rejected := true;
  end;

  if not duplicate_rejected then
    raise exception 'duplicate request key was accepted';
  end if;
end;
$$;

rollback;
