begin;

do $$
declare
  user_a uuid := '90000000-0000-4000-8000-000000000001';
  user_b uuid := '90000000-0000-4000-8000-000000000002';
  user_c uuid := '90000000-0000-4000-8000-000000000003';
  device_a1 uuid := '90000000-0000-4000-8000-000000000011';
  device_a2 uuid := '90000000-0000-4000-8000-000000000012';
  device_b uuid := '90000000-0000-4000-8000-000000000013';
  program_1 uuid := '90000000-0000-4000-8000-000000000021';
  program_2 uuid := '90000000-0000-4000-8000-000000000022';
  program_3 uuid := '90000000-0000-4000-8000-000000000023';
  program_inactive uuid := '90000000-0000-4000-8000-000000000024';
  program_missing uuid := '90000000-0000-4000-8000-000000000025';
  result_ids uuid[];
begin
  insert into auth.users(id,instance_id,aud,role,email,encrypted_password,email_confirmed_at,raw_app_meta_data,raw_user_meta_data,created_at,updated_at)
  values
    (user_a,'00000000-0000-0000-0000-000000000000','authenticated','authenticated','phase13d-a@example.invalid','',now(),'{}','{}',now(),now()),
    (user_b,'00000000-0000-0000-0000-000000000000','authenticated','authenticated','phase13d-b@example.invalid','',now(),'{}','{}',now(),now()),
    (user_c,'00000000-0000-0000-0000-000000000000','authenticated','authenticated','phase13d-c@example.invalid','',now(),'{}','{}',now(),now());
  insert into public.broadcast_programs(id,name,slug,category,is_active) values
    (program_1,'Programme 13D 1','programme-13d-1','Test',true),
    (program_2,'Programme 13D 2','programme-13d-2','Test',true),
    (program_3,'Programme 13D 3','programme-13d-3','Test',true),
    (program_inactive,'Programme 13D inactif','programme-13d-inactif','Test',false);
  insert into public.push_devices(
    id,installation_id,expo_push_token,token_hash,token_last_four,platform,runtime_environment,user_id,
    notifications_enabled,notify_new_videos,notify_live_starts,notify_followed_emissions
  ) values
    (device_a1,'install_phase13d_device0001','ExponentPushToken[phase13da1]',encode(extensions.digest(convert_to('ExponentPushToken[phase13da1]','UTF8'),'sha256'),'hex'),'da1]','android','production',user_a,false,false,true,false),
    (device_a2,'install_phase13d_device0002','ExponentPushToken[phase13da2]',encode(extensions.digest(convert_to('ExponentPushToken[phase13da2]','UTF8'),'sha256'),'hex'),'da2]','android','production',user_a,true,true,false,true),
    (device_b,'install_phase13d_device0003','ExponentPushToken[phase13db1]',encode(extensions.digest(convert_to('ExponentPushToken[phase13db1]','UTF8'),'sha256'),'hex'),'db1]','android','production',user_b,true,false,false,false);
  insert into public.push_device_program_subscriptions(push_device_id,program_id)
  values(device_a1,program_2),(device_b,program_3);
  insert into public.user_program_subscriptions(user_id,program_id) values(user_a,program_1);

  result_ids := public.reconcile_user_program_subscriptions(user_a,device_a1,array[program_3]);
  perform public.reconcile_user_program_subscriptions(user_a,device_a1,array[program_3]);
  perform public.reconcile_user_program_subscriptions(user_a,device_a1,array[program_3]);
  if cardinality(result_ids) <> 3 then raise exception 'reconcile union failed'; end if;
  if (select count(*) from public.user_program_subscriptions where user_id=user_a) <> 3 then raise exception 'account union failed'; end if;
  if (select count(*) from public.push_device_program_subscriptions where push_device_id=device_a1) <> 3 then raise exception 'current device union failed'; end if;
  if (select count(*) from public.push_device_program_subscriptions where push_device_id=device_a2) <> 3 then raise exception 'multi-device union failed'; end if;
  if (select count(*) from public.push_device_program_subscriptions where push_device_id=device_b) <> 1 then raise exception 'other user modified'; end if;
  if exists(select 1 from public.push_devices where id=device_a1 and (notifications_enabled or notify_new_videos or not notify_live_starts or notify_followed_emissions)) then raise exception 'device preferences modified'; end if;
  if exists(select 1 from public.push_devices where id=device_a2 and (not notifications_enabled or not notify_new_videos or notify_live_starts or not notify_followed_emissions)) then raise exception 'second device preferences modified'; end if;
  if exists(select 1 from public.push_devices where id=device_a1 and expo_push_token <> 'ExponentPushToken[phase13da1]')
    or exists(select 1 from public.push_devices where id=device_a2 and expo_push_token <> 'ExponentPushToken[phase13da2]') then raise exception 'device token modified'; end if;

  result_ids := public.reconcile_user_program_subscriptions(
    user_c,null,array[program_1,program_2,program_inactive,program_missing]
  );
  if result_ids <> array[program_1,program_2] then raise exception 'device-free active union failed'; end if;
  if (select count(*) from public.user_program_subscriptions where user_id=user_c) <> 2 then raise exception 'device-free account union failed'; end if;
  if exists(select 1 from public.user_program_subscriptions where user_id=user_c and program_id in (program_inactive,program_missing)) then raise exception 'inactive or missing program added'; end if;
  if exists(select 1 from public.push_devices where user_id=user_c) then raise exception 'device created by account-only reconcile'; end if;

  perform public.follow_user_program_subscription(user_a,program_1,100);
  perform public.follow_user_program_subscription(user_a,program_1,100);
  if (select count(*) from public.user_program_subscriptions where user_id=user_a and program_id=program_1) <> 1 then raise exception 'follow not idempotent'; end if;

  perform public.unfollow_user_program_subscription(user_a,program_2);
  perform public.unfollow_user_program_subscription(user_a,program_2);
  if exists(select 1 from public.user_program_subscriptions where user_id=user_a and program_id=program_2) then raise exception 'account unfollow failed'; end if;
  if exists(
    select 1 from public.push_device_program_subscriptions subscription
    join public.push_devices device on device.id=subscription.push_device_id
    where device.user_id=user_a and subscription.program_id=program_2
  ) then raise exception 'device unfollow failed'; end if;
  if (select count(*) from public.user_program_subscriptions where user_id=user_a) <> 2 then raise exception 'unfollow removed unrelated follows'; end if;

  begin
    perform public.reconcile_user_program_subscriptions(user_a,device_b,'{}'::uuid[]);
    raise exception 'cross-user device accepted';
  exception when insufficient_privilege then null;
  end;
end;
$$;

rollback;
