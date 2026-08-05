begin;

alter table public.tv_news
  add column if not exists notification_requested boolean not null default false,
  add column if not exists notified_at timestamptz null;

create table if not exists public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  owner_token_hash text not null,
  user_agent text null,
  notification_scope text not null default 'all',
  is_active boolean not null default true,
  failure_count integer not null default 0,
  last_success_at timestamptz null,
  last_failure_at timestamptz null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint push_subscriptions_endpoint_valid check (length(endpoint) <= 4096 and endpoint ~ '^https://[^[:space:]]+$'),
  constraint push_subscriptions_p256dh_valid check (length(btrim(p256dh)) between 1 and 512),
  constraint push_subscriptions_auth_valid check (length(btrim(auth)) between 1 and 512),
  constraint push_subscriptions_owner_hash_valid check (owner_token_hash ~ '^[0-9a-f]{64}$'),
  constraint push_subscriptions_user_agent_valid check (user_agent is null or length(user_agent) <= 512),
  constraint push_subscriptions_scope_valid check (notification_scope in ('all', 'breaking_only')),
  constraint push_subscriptions_failure_count_valid check (failure_count >= 0)
);

create index if not exists push_subscriptions_active_scope_idx on public.push_subscriptions (is_active, notification_scope);
create index if not exists push_subscriptions_owner_hash_idx on public.push_subscriptions (owner_token_hash);

create table if not exists public.tv_news_push_deliveries (
  id uuid primary key default gen_random_uuid(),
  news_id uuid not null references public.tv_news(id) on delete cascade,
  subscription_id uuid not null references public.push_subscriptions(id) on delete cascade,
  status text not null default 'pending',
  attempt_count integer not null default 0,
  last_error text null,
  sent_at timestamptz null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint tv_news_push_deliveries_status_valid check (status in ('pending', 'sent', 'failed', 'expired')),
  constraint tv_news_push_deliveries_attempt_count_valid check (attempt_count >= 0),
  constraint tv_news_push_deliveries_news_subscription_unique unique (news_id, subscription_id)
);

create index if not exists tv_news_push_deliveries_news_status_idx on public.tv_news_push_deliveries (news_id, status);

create or replace function public.set_push_updated_at()
returns trigger language plpgsql security invoker set search_path = '' as $function$
begin
  new.updated_at := now();
  return new;
end;
$function$;

drop trigger if exists set_push_subscriptions_updated_at on public.push_subscriptions;
create trigger set_push_subscriptions_updated_at before update on public.push_subscriptions for each row execute function public.set_push_updated_at();
drop trigger if exists set_tv_news_push_deliveries_updated_at on public.tv_news_push_deliveries;
create trigger set_tv_news_push_deliveries_updated_at before update on public.tv_news_push_deliveries for each row execute function public.set_push_updated_at();

alter table public.push_subscriptions enable row level security;
alter table public.tv_news_push_deliveries enable row level security;
revoke all on table public.push_subscriptions from public, anon, authenticated;
revoke all on table public.tv_news_push_deliveries from public, anon, authenticated;
grant all on table public.push_subscriptions to service_role;
grant all on table public.tv_news_push_deliveries to service_role;

commit;
