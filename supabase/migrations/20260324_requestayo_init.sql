create schema if not exists requestayo;

create extension if not exists pgcrypto;

create table if not exists requestayo.waitlist_submissions (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  created_at timestamptz not null default now(),
  source text,
  metadata jsonb not null default '{}'::jsonb
);

create table if not exists requestayo.user_profiles (
  id uuid primary key default gen_random_uuid(),
  email text unique,
  full_name text,
  home_city text,
  budget_sensitivity integer not null default 50,
  speed_sensitivity integer not null default 50,
  trust_sensitivity integer not null default 75,
  convenience_sensitivity integer not null default 60,
  preferences jsonb not null default '{}'::jsonb,
  disliked_providers jsonb not null default '[]'::jsonb,
  preferred_categories jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists requestayo.ayo_requests (
  id uuid primary key default gen_random_uuid(),
  user_profile_id uuid references requestayo.user_profiles(id) on delete set null,
  email text,
  request_text text not null,
  request_category text,
  request_context jsonb not null default '{}'::jsonb,
  response_summary text,
  selected_option jsonb,
  created_at timestamptz not null default now()
);

create table if not exists requestayo.provider_recommendations (
  id uuid primary key default gen_random_uuid(),
  ayo_request_id uuid not null references requestayo.ayo_requests(id) on delete cascade,
  provider_type text not null,
  provider_name text not null,
  score numeric(6,2) not null,
  price_estimate text,
  eta_estimate text,
  trust_score integer,
  notes text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists requestayo.feedback_events (
  id uuid primary key default gen_random_uuid(),
  ayo_request_id uuid not null references requestayo.ayo_requests(id) on delete cascade,
  user_profile_id uuid references requestayo.user_profiles(id) on delete set null,
  event_type text not null,
  rating integer,
  feedback_text text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create or replace function requestayo.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_requestayo_user_profiles_updated_at on requestayo.user_profiles;

create trigger trg_requestayo_user_profiles_updated_at
before update on requestayo.user_profiles
for each row
execute function requestayo.set_updated_at();

alter table requestayo.waitlist_submissions enable row level security;
alter table requestayo.user_profiles enable row level security;
alter table requestayo.ayo_requests enable row level security;
alter table requestayo.provider_recommendations enable row level security;
alter table requestayo.feedback_events enable row level security;

drop policy if exists "service_role_full_waitlist" on requestayo.waitlist_submissions;
create policy "service_role_full_waitlist"
on requestayo.waitlist_submissions
for all
to service_role
using (true)
with check (true);

drop policy if exists "service_role_full_profiles" on requestayo.user_profiles;
create policy "service_role_full_profiles"
on requestayo.user_profiles
for all
to service_role
using (true)
with check (true);

drop policy if exists "service_role_full_requests" on requestayo.ayo_requests;
create policy "service_role_full_requests"
on requestayo.ayo_requests
for all
to service_role
using (true)
with check (true);

drop policy if exists "service_role_full_recommendations" on requestayo.provider_recommendations;
create policy "service_role_full_recommendations"
on requestayo.provider_recommendations
for all
to service_role
using (true)
with check (true);

drop policy if exists "service_role_full_feedback" on requestayo.feedback_events;
create policy "service_role_full_feedback"
on requestayo.feedback_events
for all
to service_role
using (true)
with check (true);

create index if not exists idx_requestayo_waitlist_email
  on requestayo.waitlist_submissions(email);

create index if not exists idx_requestayo_profiles_email
  on requestayo.user_profiles(email);

create index if not exists idx_requestayo_requests_profile_id
  on requestayo.ayo_requests(user_profile_id);

create index if not exists idx_requestayo_requests_created_at
  on requestayo.ayo_requests(created_at desc);

create index if not exists idx_requestayo_recommendations_request_id
  on requestayo.provider_recommendations(ayo_request_id);

create index if not exists idx_requestayo_feedback_request_id
  on requestayo.feedback_events(ayo_request_id);
