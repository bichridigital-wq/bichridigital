begin;

create or replace function public.set_tv_news_timestamps()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $function$
declare
  v_now timestamptz := now();
begin
  new.updated_at := v_now;

  if tg_op = 'INSERT' then
    if coalesce(new.is_published, false) then
      new.published_at := v_now;
    else
      new.published_at := null;
    end if;
  elsif coalesce(new.is_published, false)
        and not coalesce(old.is_published, false) then
    new.published_at := v_now;
  else
    new.published_at := old.published_at;
  end if;

  return new;
end;
$function$;

commit;
