-- LaunchPod Media reporting app — core schema
create extension if not exists "pgcrypto";

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- ─────────────────────────────────────────────────────────────────────────
-- clients
-- ─────────────────────────────────────────────────────────────────────────
create table clients (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  podcast_name text not null,
  internal_slug text not null unique,
  private_access_token text not null unique,
  logo_url text,
  brand_settings jsonb not null default '{}'::jsonb,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger clients_set_updated_at
  before update on clients
  for each row execute function set_updated_at();

create index clients_active_idx on clients (active);

-- ─────────────────────────────────────────────────────────────────────────
-- reports
-- ─────────────────────────────────────────────────────────────────────────
create type report_status as enum (
  'draft', 'processing', 'needs_review', 'ready_to_publish', 'published', 'archived'
);

create table reports (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references clients (id) on delete cascade,
  title text not null,
  reporting_period_start date not null,
  reporting_period_end date not null,
  report_month text not null,
  expected_episode_frequency integer,
  previous_report_id uuid references reports (id) on delete set null,
  status report_status not null default 'draft',
  human_context text,
  report_content_json jsonb not null default '{}'::jsonb,
  published_at timestamptz,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger reports_set_updated_at
  before update on reports
  for each row execute function set_updated_at();

create index reports_client_id_idx on reports (client_id);
create index reports_status_idx on reports (status);

-- ─────────────────────────────────────────────────────────────────────────
-- report_uploads
-- ─────────────────────────────────────────────────────────────────────────
create type upload_source_type as enum ('spotify', 'apple', 'podseo', 'hosting');
create type parsing_status as enum ('pending', 'processing', 'parsed', 'manual_only', 'failed');
create type upload_validation_status as enum ('unverified', 'verified', 'conflict');

create table report_uploads (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references reports (id) on delete cascade,
  source_type upload_source_type not null,
  file_name text not null,
  file_type text not null,
  file_size_bytes bigint not null default 0,
  storage_path text not null,
  snapshot_date date,
  parsing_status parsing_status not null default 'pending',
  parsing_errors text,
  validation_status upload_validation_status not null default 'unverified',
  uploaded_by uuid references auth.users (id) on delete set null,
  uploaded_at timestamptz not null default now()
);

create index report_uploads_report_id_idx on report_uploads (report_id);
create index report_uploads_source_type_idx on report_uploads (source_type);

-- ─────────────────────────────────────────────────────────────────────────
-- report_metrics
-- ─────────────────────────────────────────────────────────────────────────
create type metric_unit as enum ('count', 'percent', 'minutes', 'hours', 'rank', 'score');
create type authority_level as enum (
  'authoritative_csv', 'platform_export', 'verified_screenshot', 'manual_verified'
);
create type verification_status as enum ('unverified', 'verified', 'conflict', 'excluded');

create table report_metrics (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references reports (id) on delete cascade,
  upload_id uuid references report_uploads (id) on delete set null,
  source_type upload_source_type not null,
  original_label text not null,
  metric_key text not null,
  display_label text not null,
  value text,
  previous_value numeric,
  calculated_delta numeric,
  unit metric_unit not null default 'count',
  period_start date,
  period_end date,
  snapshot_date date,
  authority_level authority_level not null default 'manual_verified',
  verification_status verification_status not null default 'unverified',
  source_page integer,
  source_reference text,
  manually_adjusted boolean not null default false,
  included_in_report boolean not null default true,
  notes text,
  entered_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger report_metrics_set_updated_at
  before update on report_metrics
  for each row execute function set_updated_at();

create index report_metrics_report_id_idx on report_metrics (report_id);
create index report_metrics_metric_key_idx on report_metrics (report_id, metric_key);
create index report_metrics_verification_idx on report_metrics (verification_status);

-- ─────────────────────────────────────────────────────────────────────────
-- report_observations (deterministic rule-engine output)
-- ─────────────────────────────────────────────────────────────────────────
create table report_observations (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references reports (id) on delete cascade,
  source_type text,
  metric_key text,
  rule_id text not null,
  generated_text text not null,
  edited_text text,
  included_in_report boolean not null default true,
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger report_observations_set_updated_at
  before update on report_observations
  for each row execute function set_updated_at();

create index report_observations_report_id_idx on report_observations (report_id);

-- ─────────────────────────────────────────────────────────────────────────
-- report_sections
-- ─────────────────────────────────────────────────────────────────────────
create table report_sections (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references reports (id) on delete cascade,
  section_type text not null,
  enabled boolean not null default true,
  display_order integer not null default 0,
  content_json jsonb not null default '{}'::jsonb,
  internal_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (report_id, section_type)
);

create trigger report_sections_set_updated_at
  before update on report_sections
  for each row execute function set_updated_at();

create index report_sections_report_id_idx on report_sections (report_id, display_order);

-- ─────────────────────────────────────────────────────────────────────────
-- recommendations
-- ─────────────────────────────────────────────────────────────────────────
create type recommendation_owner as enum ('client', 'lpm', 'shared');

create table recommendations (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references reports (id) on delete cascade,
  text text not null,
  owner recommendation_owner not null default 'lpm',
  included boolean not null default true,
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger recommendations_set_updated_at
  before update on recommendations
  for each row execute function set_updated_at();

create index recommendations_report_id_idx on recommendations (report_id, display_order);
