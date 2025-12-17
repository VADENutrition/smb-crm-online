create extension if not exists pgcrypto;

create table if not exists companies (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  name text not null,
  domain text,
  industry text,
  created_at timestamptz not null default now()
);

create table if not exists contacts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  company_id uuid references companies(id) on delete set null,
  first_name text not null,
  last_name text,
  email text,
  phone text,
  title text,
  created_at timestamptz not null default now()
);

create table if not exists pipelines (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  name text not null,
  created_at timestamptz not null default now()
);

create table if not exists stages (
  id uuid primary key default gen_random_uuid(),
  pipeline_id uuid not null references pipelines(id) on delete cascade,
  name text not null,
  stage_order int not null,
  probability int not null default 50
);

create table if not exists deals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  pipeline_id uuid not null references pipelines(id) on delete cascade,
  stage_id uuid not null references stages(id),
  company_id uuid references companies(id) on delete set null,
  name text not null,
  amount int,
  close_date timestamptz,
  probability int not null default 50,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists deal_contacts (
  deal_id uuid not null references deals(id) on delete cascade,
  contact_id uuid not null references contacts(id) on delete cascade,
  primary key (deal_id, contact_id)
);

create type activity_type as enum ('NOTE','EMAIL','MEETING','CALL','SYSTEM');

create table if not exists activities (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  deal_id uuid references deals(id) on delete cascade,
  company_id uuid references companies(id) on delete set null,
  contact_id uuid references contacts(id) on delete set null,
  type activity_type not null,
  subject text,
  body text,
  external_id text,
  occurred_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists idx_activities_user_occurred on activities(user_id, occurred_at desc);
create index if not exists idx_activities_external_id on activities(external_id);

create table if not exists tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  deal_id uuid references deals(id) on delete cascade,
  title text not null,
  due_date timestamptz,
  completed boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists google_auth (
  user_id uuid primary key,
  access_token text not null,
  refresh_token text not null,
  scope text,
  token_type text,
  expiry_date timestamptz,
  updated_at timestamptz not null default now()
);

create table if not exists memory_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  scope text not null,
  scope_id uuid,
  key text not null,
  content text not null,
  weight int not null default 50,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create unique index if not exists uq_memory_item on memory_items(user_id, scope, scope_id, key);
