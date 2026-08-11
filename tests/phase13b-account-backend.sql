begin;

do $$
declare
  user_a uuid := '81000000-0000-4000-8000-000000000001';
  user_b uuid := '81000000-0000-4000-8000-000000000002';
  program_a uuid := '82000000-0000-4000-8000-000000000001';
  device_a uuid := '83000000-0000-4000-8000-000000000001';
begin
  insert into auth.users (id,instance_id,aud,role,email,encrypted_password,email_confirmed_at,raw_app_meta_data,raw_user_meta_data,created_at,updated_at)
  values
    (user_a,'00000000-0000-0000-0000-000000000000','authenticated','authenticated','phase13b-a@example.invalid','',now(),'{}','{"role":"admin"}',now(),now()),
    (user_b,'00000000-0000-0000-0000-000000000000','authenticated','authenticated','phase13b-b@example.invalid','',now(),'{}','{}',now(),now());

  if exists(select 1 from public.admin_users where user_id in (user_a,user_b)) then raise exception 'normal user became admin'; end if;
  insert into public.broadcast_programs(id,name,slug,category,is_active) values(program_a,'Programme compte test','programme-compte-test','Test',true);
  insert into public.profiles(user_id,display_name) values(user_a,'Utilisateur A'),(user_b,'Utilisateur B');
  insert into public.user_program_subscriptions(user_id,program_id) values(user_a,program_a);
  insert into public.user_program_subscriptions(user_id,program_id) values(user_a,program_a) on conflict do nothing;
  if (select count(*) from public.user_program_subscriptions where user_id=user_a and program_id=program_a) <> 1 then raise exception 'subscription uniqueness failed'; end if;

  begin
    update public.profiles set display_name=' x ' where user_id=user_a;
    raise exception 'invalid display_name accepted';
  exception when check_violation then null;
  end;

  insert into public.push_devices(id,installation_id,expo_push_token,token_hash,token_last_four,platform,runtime_environment,user_id)
  values(device_a,'install_phase13b_device0001','ExponentPushToken[phase13bdevice]',encode(extensions.digest(convert_to('ExponentPushToken[phase13bdevice]','UTF8'),'sha256'),'hex'),'ice]','android','production',user_a);
  delete from auth.users where id=user_a;
  if (select user_id is not null from public.push_devices where id=device_a) then raise exception 'device not unlinked'; end if;
  if exists(select 1 from public.profiles where user_id=user_a) or exists(select 1 from public.user_program_subscriptions where user_id=user_a) then raise exception 'cascade failed'; end if;

  if not has_table_privilege('authenticated','public.profiles','select') or has_table_privilege('authenticated','public.profiles','delete') then raise exception 'profile grants invalid'; end if;
  if has_table_privilege('anon','public.profiles','select') or has_table_privilege('anon','public.user_program_subscriptions','select') then raise exception 'anon access granted'; end if;
  if has_function_privilege('authenticated','public.consume_account_rate_limit(text,text,integer,integer)','execute') then raise exception 'rate function exposed'; end if;
end;
$$;

insert into auth.users (id,instance_id,aud,role,email,encrypted_password,email_confirmed_at,raw_app_meta_data,raw_user_meta_data,created_at,updated_at)
values
  ('81000000-0000-4000-8000-000000000003','00000000-0000-0000-0000-000000000000','authenticated','authenticated','phase13b-c@example.invalid','',now(),'{}','{"role":"admin"}',now(),now()),
  ('81000000-0000-4000-8000-000000000004','00000000-0000-0000-0000-000000000000','authenticated','authenticated','phase13b-d@example.invalid','',now(),'{}','{}',now(),now());
insert into public.profiles(user_id,display_name) values
  ('81000000-0000-4000-8000-000000000003','Utilisateur C'),
  ('81000000-0000-4000-8000-000000000004','Utilisateur D');
insert into public.user_program_subscriptions(user_id,program_id) values
  ('81000000-0000-4000-8000-000000000003','82000000-0000-4000-8000-000000000001'),
  ('81000000-0000-4000-8000-000000000004','82000000-0000-4000-8000-000000000001');

set local role authenticated;
select set_config('request.jwt.claim.sub','81000000-0000-4000-8000-000000000003',true);
do $$
declare visible_count integer; changed_count integer;
begin
  select count(*) into visible_count from public.profiles;
  if visible_count <> 1 then raise exception 'profile RLS isolation failed'; end if;
  update public.profiles set display_name='Tentative interdite'
  where user_id='81000000-0000-4000-8000-000000000004';
  get diagnostics changed_count = row_count;
  if changed_count <> 0 then raise exception 'cross-user profile update succeeded'; end if;
  if public.is_admin() then raise exception 'user metadata granted admin'; end if;
  if exists(select 1 from public.user_program_subscriptions where user_id <> (select auth.uid())) then
    raise exception 'subscription RLS isolation failed';
  end if;
  delete from public.user_program_subscriptions
  where user_id='81000000-0000-4000-8000-000000000004';
  get diagnostics changed_count = row_count;
  if changed_count <> 0 then raise exception 'cross-user subscription delete succeeded'; end if;
end;
$$;
reset role;

set local role anon;
do $$
begin
  begin
    perform 1 from public.profiles;
    raise exception 'anon read profiles';
  exception when insufficient_privilege then null;
  end;
end;
$$;
reset role;

rollback;
