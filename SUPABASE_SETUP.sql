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

-- v84 community CRM + email system upgrade
-- This section is additive and safe to run on the live database.
alter table public.trendies_interest_responses add column if not exists updated_at timestamptz not null default now();
alter table public.trendies_interest_responses add column if not exists email_normalized text;
alter table public.trendies_interest_responses add column if not exists first_name text;
alter table public.trendies_interest_responses add column if not exists full_name text;
alter table public.trendies_interest_responses add column if not exists social_handle text;
alter table public.trendies_interest_responses add column if not exists helper_type text;
alter table public.trendies_interest_responses add column if not exists confirmed_18_plus boolean default false;
alter table public.trendies_interest_responses add column if not exists referral_code text;
alter table public.trendies_interest_responses add column if not exists referred_by text;
alter table public.trendies_interest_responses add column if not exists signup_source text default 'website_interest_form';
alter table public.trendies_interest_responses add column if not exists email_preferences jsonb default '{
  "general_updates": true,
  "city_chapter_updates": true,
  "volunteer_helper_updates": true,
  "creative_opportunities": true,
  "brand_partner_updates": true
}'::jsonb;
alter table public.trendies_interest_responses add column if not exists unsubscribe_token text;
alter table public.trendies_interest_responses add column if not exists welcome_email_sent_at timestamptz;
alter table public.trendies_interest_responses add column if not exists welcome_email_last_error text;
alter table public.trendies_interest_responses add column if not exists unsubscribed_at timestamptz;
alter table public.trendies_interest_responses add column if not exists what_would_make_you_show_up text;
alter table public.trendies_interest_responses add column if not exists what_would_make_it_feel_safe text;
alter table public.trendies_interest_responses add column if not exists resend_contact_id text;
alter table public.trendies_interest_responses add column if not exists last_resend_error text;
alter table public.trendies_interest_responses add column if not exists email_bounced_at timestamptz;

update public.trendies_interest_responses
set
  email_normalized = coalesce(email_normalized, lower(nullif(trim(email), ''))),
  full_name = coalesce(full_name, name),
  first_name = coalesce(first_name, split_part(coalesce(nullif(trim(name), ''), 'there'), ' ', 1)),
  social_handle = coalesce(social_handle, social),
  helper_type = coalesce(helper_type, answers->>'help_build'),
  confirmed_18_plus = coalesce(confirmed_18_plus, age >= 18),
  what_would_make_you_show_up = coalesce(what_would_make_you_show_up, answers->>'show_up_reason'),
  what_would_make_it_feel_safe = coalesce(what_would_make_it_feel_safe, answers->>'safety_needs'),
  updated_at = coalesce(updated_at, created_at)
where email is not null;

create index if not exists trendies_interest_email_normalized_idx on public.trendies_interest_responses(email_normalized, created_at desc);
create index if not exists trendies_interest_email_optin_idx on public.trendies_interest_responses(wants_updates, confirmed_18_plus, unsubscribed_at, created_at desc);
create index if not exists trendies_interest_city_idx on public.trendies_interest_responses(city, country, created_at desc);
create index if not exists trendies_interest_helper_type_idx on public.trendies_interest_responses(helper_type, created_at desc);
create index if not exists trendies_interest_referred_by_idx on public.trendies_interest_responses(referred_by, created_at desc);
create unique index if not exists trendies_interest_unsubscribe_token_idx on public.trendies_interest_responses(unsubscribe_token) where unsubscribe_token is not null;
create unique index if not exists trendies_interest_referral_code_idx on public.trendies_interest_responses(referral_code) where referral_code is not null;

-- Partner / sponsor / venue pipeline
create table if not exists public.trendies_partner_enquiries (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  name text not null,
  email text not null,
  organisation text,
  role text,
  city_country text,
  support_type text not null,
  message text not null,
  status text not null default 'new',
  notes text,
  user_agent text,
  ip_hash text
);
create index if not exists trendies_partner_enquiries_created_idx on public.trendies_partner_enquiries(created_at desc);
create index if not exists trendies_partner_enquiries_status_idx on public.trendies_partner_enquiries(status, created_at desc);
create index if not exists trendies_partner_enquiries_support_type_idx on public.trendies_partner_enquiries(support_type, created_at desc);
alter table public.trendies_partner_enquiries enable row level security;

-- Email campaign logs for admin broadcasts and onboarding attempts
create table if not exists public.trendies_email_campaigns (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  subject text not null,
  preview_text text,
  body text,
  cta_label text,
  cta_url text,
  sent_at timestamptz,
  sent_by text,
  audience_filter jsonb default '{}'::jsonb,
  recipient_count integer default 0,
  status text not null default 'draft',
  resend_email_ids jsonb default '[]'::jsonb
);
create index if not exists trendies_email_campaigns_created_idx on public.trendies_email_campaigns(created_at desc);
create index if not exists trendies_email_campaigns_status_idx on public.trendies_email_campaigns(status, created_at desc);
alter table public.trendies_email_campaigns enable row level security;

create table if not exists public.trendies_email_deliveries (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  campaign_id uuid references public.trendies_email_campaigns(id) on delete set null,
  recipient_email text,
  recipient_user_id uuid references public.trendies_interest_responses(id) on delete set null,
  resend_email_id text,
  status text not null default 'queued',
  error_message text,
  sent_at timestamptz
);
create index if not exists trendies_email_deliveries_campaign_idx on public.trendies_email_deliveries(campaign_id, created_at desc);
create index if not exists trendies_email_deliveries_recipient_idx on public.trendies_email_deliveries(recipient_email, created_at desc);
create index if not exists trendies_email_deliveries_status_idx on public.trendies_email_deliveries(status, created_at desc);
alter table public.trendies_email_deliveries enable row level security;

create or replace view public.trendies_dashboard_totals as
select
  (select count(*)::integer from public.trendies_interest_responses) as interests,
  (select count(*)::integer from public.trendies_interest_responses where wants_updates is true) as email_opt_ins,
  (select count(*)::integer from public.trendies_interest_responses where confirmed_18_plus is true) as confirmed_18_plus,
  (select count(*)::integer from public.trendies_interest_responses where unsubscribed_at is not null) as unsubscribed,
  (select count(*)::integer from public.trendies_wall_notes) as wall_notes,
  (select count(*)::integer from public.trendies_country_pins) as country_pin_submissions,
  (select count(distinct country_normalized)::integer from public.trendies_country_pins) as countries_pinned,
  (
    select count(*)::integer
    from public.trendies_interest_responses
    where coalesce(respondent_type, 'general trendie') <> 'general trendie'
       or nullif(helper_type, '') is not null
  ) as partners_or_helpers,
  (select count(*)::integer from public.trendies_partner_enquiries) as partner_enquiries;

create or replace view public.trendies_interest_city_counts as
with base as (
  select
    coalesce(nullif(trim(city), ''), 'Unknown') as city,
    coalesce(nullif(trim(country), ''), 'Unknown') as country,
    activity_tags
  from public.trendies_interest_responses
),
city_counts as (
  select city, country, count(*)::integer as count
  from base
  group by city, country
)
select
  c.city,
  c.country,
  c.count,
  coalesce((
    select tag
    from base b,
      lateral unnest(coalesce(b.activity_tags, array[]::text[])) as tag
    where b.city = c.city and b.country = c.country
    group by tag
    order by count(*) desc, tag
    limit 1
  ), 'general coming-of-age summer') as top_activity,
  case
    when c.count >= 25 then 'chapter potential'
    when c.count >= 8 then 'nearly ready'
    else 'warming up'
  end as status
from city_counts c;

create or replace view public.trendies_interest_city_breakdown as
select
  coalesce(nullif(trim(city), ''), 'Unknown') as label,
  coalesce(nullif(trim(country), ''), 'Unknown') as country,
  count(*)::integer as count
from public.trendies_interest_responses
group by 1, 2;

create or replace view public.trendies_interest_helper_type_counts as
select
  coalesce(nullif(helper_type, ''), nullif(respondent_type, ''), 'not specified') as label,
  count(*)::integer as count
from public.trendies_interest_responses
group by 1;

create or replace view public.trendies_interest_opt_in_counts as
select 'email opt-ins' as label, count(*)::integer as count
from public.trendies_interest_responses
where wants_updates is true
union all
select '18+ confirmed' as label, count(*)::integer as count
from public.trendies_interest_responses
where confirmed_18_plus is true
union all
select 'unsubscribed' as label, count(*)::integer as count
from public.trendies_interest_responses
where unsubscribed_at is not null;

create or replace view public.trendies_referral_counts as
select
  referred_by as label,
  count(*)::integer as count
from public.trendies_interest_responses
where nullif(referred_by, '') is not null
group by referred_by;

create or replace view public.trendies_partner_support_type_counts as
select
  coalesce(nullif(support_type, ''), 'Unknown') as label,
  count(*)::integer as count
from public.trendies_partner_enquiries
group by 1;
