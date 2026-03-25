create table if not exists requestayo.user_provider_preferences (
  id uuid primary key default gen_random_uuid(),
  user_profile_id uuid not null references requestayo.user_profiles(id) on delete cascade,
  provider_name text not null,
  provider_type text not null,
  preference_score integer not null default 50,
  total_selections integer not null default 0,
  total_positive_feedback integer not null default 0,
  total_negative_feedback integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_profile_id, provider_name, provider_type)
);

alter table requestayo.user_provider_preferences enable row level security;

drop policy if exists "service_role_full_user_provider_preferences" on requestayo.user_provider_preferences;
create policy "service_role_full_user_provider_preferences"
on requestayo.user_provider_preferences
for all
to service_role
using (true)
with check (true);

drop trigger if exists trg_requestayo_user_provider_preferences_updated_at on requestayo.user_provider_preferences;

create trigger trg_requestayo_user_provider_preferences_updated_at
before update on requestayo.user_provider_preferences
for each row
execute function requestayo.set_updated_at();

create index if not exists idx_requestayo_user_provider_preferences_profile_id
  on requestayo.user_provider_preferences(user_profile_id);

create index if not exists idx_requestayo_feedback_events_profile_id
  on requestayo.feedback_events(user_profile_id);

create index if not exists idx_requestayo_feedback_events_created_at
  on requestayo.feedback_events(created_at desc);
