alter table requestayo.ayo_requests
add column if not exists completion_status text not null default 'pending';

alter table requestayo.ayo_requests
add column if not exists completed_at timestamptz;

alter table requestayo.ayo_requests
add column if not exists selected_provider_name text;

alter table requestayo.ayo_requests
add column if not exists selected_provider_type text;

alter table requestayo.ayo_requests
add column if not exists selected_score numeric(6,2);

alter table requestayo.ayo_requests
add column if not exists explanation jsonb not null default '{}'::jsonb;

create index if not exists idx_requestayo_requests_completion_status
  on requestayo.ayo_requests(completion_status);

create index if not exists idx_requestayo_requests_selected_provider_name
  on requestayo.ayo_requests(selected_provider_name);
