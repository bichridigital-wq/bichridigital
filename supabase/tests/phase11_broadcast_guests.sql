begin;

create or replace function public.is_admin()
returns boolean
language sql
stable
security invoker
set search_path = ''
as $function$
  select true;
$function$;

do $test$
declare
  v_schedule_id constant uuid := '10000000-0000-4000-8000-000000000001';
  first_guest_id constant uuid := '20000000-0000-4000-8000-000000000001';
  second_guest_id constant uuid := '20000000-0000-4000-8000-000000000002';
  second_schedule_id constant uuid := '10000000-0000-4000-8000-000000000002';
  association_id uuid;
  snapshot_name text;
  snapshot_photo text;
  association_count integer;
  rejected boolean;
begin
  insert into public.broadcast_schedule (
    id,
    title,
    scheduled_start_time
  ) values (
    v_schedule_id,
    'Phase 11 isolated test',
    now() + interval '1 day'
  );

  insert into public.broadcast_guests (
    id,
    full_name,
    slug,
    photo_url,
    photo_storage_path
  ) values (
    first_guest_id,
    'Initial database name',
    'phase-11-first-guest',
    'https://example.test/first.jpg',
    'guests/20000000-0000-4000-8000-000000000001/30000000-0000-4000-8000-000000000001.jpg'
  ), (
    second_guest_id,
    'Second database name',
    'phase-11-second-guest',
    null,
    null
  );

  rejected := false;
  begin
    insert into public.broadcast_guests (
      full_name,
      slug,
      photo_url,
      photo_storage_path
    ) values (
      'Invalid photo pair',
      'phase-11-invalid-photo-pair',
      'https://example.test/invalid.jpg',
      null
    );
  exception
    when check_violation then
      rejected := true;
  end;
  if not rejected then
    raise exception 'photo_url without photo_storage_path was accepted';
  end if;

  perform public.sync_broadcast_schedule_guests(
    v_schedule_id,
    jsonb_build_array(jsonb_build_object(
      'association_id', null,
      'guest_id', first_guest_id,
      'sort_order', 0,
      'guest_name_snapshot', 'Forged browser name'
    ))
  );
  select id, guest_name_snapshot, guest_photo_url_snapshot
  into association_id, snapshot_name, snapshot_photo
  from public.broadcast_schedule_guests
  where broadcast_schedule_guests.schedule_id = v_schedule_id;
  if snapshot_name <> 'Initial database name'
    or snapshot_photo <> 'https://example.test/first.jpg'
  then
    raise exception 'A new snapshot did not use the guest record';
  end if;

  update public.broadcast_guests
  set full_name = 'Updated database name'
  where id = first_guest_id;
  perform public.sync_broadcast_schedule_guests(
    v_schedule_id,
    jsonb_build_array(jsonb_build_object(
      'association_id', association_id,
      'guest_id', first_guest_id,
      'sort_order', 0,
      'guest_name_snapshot', 'Second forged browser name'
    ))
  );
  select id, guest_name_snapshot
  into association_id, snapshot_name
  from public.broadcast_schedule_guests
  where broadcast_schedule_guests.schedule_id = v_schedule_id;
  if snapshot_name <> 'Initial database name' then
    raise exception 'The existing snapshot was not preserved by default';
  end if;

  perform public.sync_broadcast_schedule_guests(
    v_schedule_id,
    jsonb_build_array(jsonb_build_object(
      'association_id', association_id,
      'guest_id', first_guest_id,
      'sort_order', 0,
      'refresh_snapshot', true
    ))
  );
  select id, guest_name_snapshot
  into association_id, snapshot_name
  from public.broadcast_schedule_guests
  where broadcast_schedule_guests.schedule_id = v_schedule_id;
  if snapshot_name <> 'Updated database name' then
    raise exception 'Explicit snapshot refresh did not use the guest record';
  end if;

  delete from public.broadcast_guests where id = first_guest_id;
  perform public.sync_broadcast_schedule_guests(
    v_schedule_id,
    jsonb_build_array(jsonb_build_object(
      'association_id', association_id,
      'guest_id', null,
      'sort_order', 0,
      'guest_name_snapshot', 'Forged historical name'
    ))
  );
  select id, guest_name_snapshot, guest_photo_url_snapshot
  into association_id, snapshot_name, snapshot_photo
  from public.broadcast_schedule_guests
  where broadcast_schedule_guests.schedule_id = v_schedule_id;
  if snapshot_name <> 'Updated database name'
    or snapshot_photo <> 'https://example.test/first.jpg'
  then
    raise exception 'The historical snapshot was not preserved';
  end if;

  rejected := false;
  begin
    perform public.sync_broadcast_schedule_guests(
      v_schedule_id,
      '[{"association_id":null,"guest_id":"invalid","sort_order":0}]'::jsonb
    );
  exception
    when data_exception then
      rejected := true;
  end;
  if not rejected then
    raise exception 'An invalid UUID was accepted';
  end if;

  select count(*) into association_count
  from public.broadcast_schedule_guests
  where broadcast_schedule_guests.schedule_id = v_schedule_id
    and guest_name_snapshot = 'Updated database name';
  if association_count <> 1 then
    raise exception 'A validation failure changed existing associations';
  end if;

  rejected := false;
  begin
    perform public.sync_broadcast_schedule_guests(
      v_schedule_id,
      jsonb_build_array(
        jsonb_build_object(
          'association_id', null,
          'guest_id', second_guest_id,
          'sort_order', 0
        ),
        jsonb_build_object(
          'association_id', null,
          'guest_id', second_guest_id,
          'sort_order', 1
        )
      )
    );
  exception
    when data_exception then
      rejected := true;
  end;
  if not rejected then
    raise exception 'A duplicate guest was accepted';
  end if;

  select count(*) into association_count
  from public.broadcast_schedule_guests
  where guest_photo_url_snapshot = 'https://example.test/first.jpg';
  if association_count <> 1 then
    raise exception 'The historical photo reference was not retained';
  end if;
  select count(*) into association_count
  from public.broadcast_schedule_guests
  where guest_photo_url_snapshot = 'https://example.test/unreferenced.jpg';
  if association_count <> 0 then
    raise exception 'The unreferenced photo check returned an unexpected row';
  end if;

  update public.broadcast_guests
  set is_active = false, sort_order = 4
  where id = second_guest_id;
  if not exists (
    select 1 from public.broadcast_guests
    where id = second_guest_id and is_active = false and sort_order = 4
  ) then
    raise exception 'Guest deactivation or ordering failed';
  end if;

  insert into public.broadcast_schedule (
    id,
    title,
    scheduled_start_time
  ) values (
    second_schedule_id,
    'Phase 11 deletion compatibility test',
    now() + interval '2 days'
  );
  perform public.sync_broadcast_schedule_guests(
    second_schedule_id,
    jsonb_build_array(jsonb_build_object(
      'association_id', null,
      'guest_id', second_guest_id,
      'sort_order', 0
    ))
  );
  delete from public.broadcast_schedule where id = second_schedule_id;
  if not exists (
    select 1 from public.broadcast_guests where id = second_guest_id
  ) then
    raise exception 'Deleting a schedule event deleted its guest';
  end if;

  perform public.sync_broadcast_schedule_guests(v_schedule_id, '[]'::jsonb);
  if exists (
    select 1 from public.broadcast_schedule_guests
    where broadcast_schedule_guests.schedule_id = v_schedule_id
  ) then
    raise exception 'An empty guest selection was not accepted';
  end if;
  if not exists (
    select 1 from public.broadcast_schedule where id = v_schedule_id
  ) then
    raise exception 'Synchronizing an empty selection deleted the event';
  end if;
end;
$test$;

rollback;
