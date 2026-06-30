create extension if not exists pgcrypto;

create table if not exists public.trendies_interest_responses (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text,
  email text,
  age integer,
  social text,
  city text,
  country text,
  wants_updates boolean default false,
  activity_tags text[],
  answers jsonb default '{}'::jsonb,
  user_agent text,
  ip_hash text
);

create index if not exists trendies_interest_created_idx on public.trendies_interest_responses (created_at desc);
create index if not exists trendies_interest_country_idx on public.trendies_interest_responses (country, city, created_at desc);
alter table public.trendies_interest_responses enable row level security;

create table if not exists public.trendies_country_pins (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  country text not null,
  country_normalized text not null,
  flag text,
  user_agent text,
  ip_hash text
);
create index if not exists trendies_country_pins_country_idx on public.trendies_country_pins(country_normalized, created_at desc);
alter table public.trendies_country_pins enable row level security;

create table if not exists public.trendies_wall_notes (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  note text not null,
  note_censored text not null,
  country text,
  category text,
  vibe text,
  note_type text default 'anonymous_wall',
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  user_agent text,
  ip_hash text
);
create index if not exists trendies_wall_notes_status_idx on public.trendies_wall_notes(status, created_at desc);
create index if not exists trendies_wall_notes_category_idx on public.trendies_wall_notes(category, created_at desc);
alter table public.trendies_wall_notes enable row level security;

-- Keep RLS enabled with no public policies. Netlify Functions use the service role key server-side.


-- v61 categorised live data upgrade
alter table public.trendies_interest_responses add column if not exists region text;
alter table public.trendies_interest_responses add column if not exists respondent_type text;
alter table public.trendies_interest_responses add column if not exists partnership_type text;
alter table public.trendies_interest_responses add column if not exists intent_strength text;
alter table public.trendies_interest_responses add column if not exists safety_tags text[];
alter table public.trendies_interest_responses add column if not exists categorisation_source text default 'rules';
alter table public.trendies_interest_responses add column if not exists ai_summary text;
alter table public.trendies_interest_responses add column if not exists ai_priority text;
alter table public.trendies_interest_responses add column if not exists ai_tags text[];

create index if not exists trendies_interest_region_idx on public.trendies_interest_responses(region, created_at desc);
create index if not exists trendies_interest_respondent_type_idx on public.trendies_interest_responses(respondent_type, created_at desc);
create index if not exists trendies_interest_partnership_type_idx on public.trendies_interest_responses(partnership_type, created_at desc);
create index if not exists trendies_interest_intent_strength_idx on public.trendies_interest_responses(intent_strength, created_at desc);
create index if not exists trendies_interest_ai_priority_idx on public.trendies_interest_responses(ai_priority, created_at desc);

-- v63 launch traffic views
-- These keep the dashboard and flag wall fast as signups and country submissions grow.
create or replace view public.trendies_dashboard_totals as
select
  (select count(*)::integer from public.trendies_interest_responses) as interests,
  (select count(*)::integer from public.trendies_wall_notes) as wall_notes,
  (select count(*)::integer from public.trendies_country_pins) as country_pin_submissions,
  (select count(distinct country_normalized)::integer from public.trendies_country_pins) as countries_pinned,
  (
    select count(*)::integer
    from public.trendies_interest_responses
    where coalesce(respondent_type, 'general trendie') <> 'general trendie'
  ) as partners_or_helpers;

create or replace view public.trendies_country_pin_counts as
select
  country_normalized,
  (array_agg(country order by created_at desc))[1] as country,
  coalesce((array_agg(flag order by created_at desc))[1], '📍') as flag,
  count(*)::integer as count
from public.trendies_country_pins
group by country_normalized;

create or replace view public.trendies_interest_region_counts as
select coalesce(nullif(region, ''), 'Unknown') as label, count(*)::integer as count
from public.trendies_interest_responses
group by 1;

create or replace view public.trendies_interest_respondent_type_counts as
select coalesce(nullif(respondent_type, ''), 'Unknown') as label, count(*)::integer as count
from public.trendies_interest_responses
group by 1;

create or replace view public.trendies_interest_partnership_type_counts as
select coalesce(nullif(partnership_type, ''), 'Unknown') as label, count(*)::integer as count
from public.trendies_interest_responses
group by 1;

create or replace view public.trendies_interest_intent_strength_counts as
select coalesce(nullif(intent_strength, ''), 'Unknown') as label, count(*)::integer as count
from public.trendies_interest_responses
group by 1;

create or replace view public.trendies_interest_country_counts as
select coalesce(nullif(country, ''), 'Unknown') as label, count(*)::integer as count
from public.trendies_interest_responses
group by 1;

create or replace view public.trendies_interest_activity_tag_counts as
select tag as label, count(*)::integer as count
from public.trendies_interest_responses,
  lateral unnest(coalesce(activity_tags, array[]::text[])) as tag
group by tag;

create or replace view public.trendies_interest_safety_tag_counts as
select tag as label, count(*)::integer as count
from public.trendies_interest_responses,
  lateral unnest(coalesce(safety_tags, array[]::text[])) as tag
group by tag;
